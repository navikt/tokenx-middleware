import { validateIdportenToken } from '@navikt/next-auth-wonderwall';
import { extractSubjectToken, getAuthorizationHeader } from './header-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from './logger';

type ApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse,
    subjectToken: string
) => Promise<unknown>;

type ProxyApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse,
    proxyOptions: string
) => Promise<unknown>;

export function withAuthenticatedApiRoute(handler: ApiHandler, logger: Logger = console) {
    return async function withAccessToken(req: NextApiRequest, res: NextApiResponse) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Is running locally, skipping authentication for api');
            return await handler(req, res, 'fake-access-token');
        }
        const authHeader = getAuthorizationHeader(req);
        if (!authHeader) {
            return res.status(401).json({ message: 'No token found in authorization header' });
        }

        const validationResult = await validateIdportenToken(authHeader);
        if (validationResult === 'valid') {
            return handler(req, res, extractSubjectToken(authHeader));
        } else {
            logger.info(
                `Failed to validate due to: ${validationResult.errorType} ${validationResult.message}`
            );
            return res.status(401).json({ message: 'Not authenticated' });
        }
    };
}

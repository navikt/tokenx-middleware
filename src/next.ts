import { validateIdportenToken } from '@navikt/next-auth-wonderwall';
import { extractSubjectToken, getAuthorizationHeader } from './header-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from './logger';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse, accessToken: string) => Promise<void>;

export function withAuthenticatedApiRoute(handler: ApiHandler, logger: Logger = console) {
    return async function withBearerToken(req: NextApiRequest, res: NextApiResponse) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Is running locally, skipping authentication for page');
            return await handler(req, res, 'fakeAccessToken');
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

import { validateIdportenToken } from '@navikt/next-auth-wonderwall';
import { extractSubjectToken, getAuthorizationHeader } from './header-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from './logger';
import { IncomingMessage } from 'http';

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

// export function withAuthenticatedProxyRoute(handler: ProxyApiHandler) {
//     return async function (req, res) {};
// }

/**
 * Exchanges subject token found in the authorization header with a access token for a given audience.
 * If the subject token is not found, or the token exchange failed, `null` will be returned.
 */
export async function exchangeIdportenSubjectToken(
    request: IncomingMessage,
    audience?: string,
    logger: Logger = console
): Promise<string | null> {
    const authHeader = getAuthorizationHeader(request);

    // return the original header if no subject token is found
    if (!authHeader) {
        logger.debug('Cannot exhange subject token because it was not found.');
        return null;
    }

    const validationResult = await validateIdportenToken(authHeader);
    if (validationResult === 'valid') {
        return extractSubjectToken(authHeader);
    } else {
        logger.info(
            `Failed to validate due to: ${validationResult.errorType} ${validationResult.message}`
        );
        return null;
    }
}

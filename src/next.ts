import {
    grantTokenXOboToken,
    isInvalidTokenSet,
    validateIdportenToken,
} from '@navikt/next-auth-wonderwall';
import { extractToken, getAuthorizationHeader } from './header-utils.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from './logger.js';
import { IncomingMessage } from 'http';

type AuthenticatedApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse,
    accessToken: string
) => Promise<unknown>;

export function withApiAuthentication(
    handler: AuthenticatedApiHandler,
    audience: string,
    logger: Logger = console
) {
    return async function withTokenExchange(req: NextApiRequest, res: NextApiResponse) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Is running locally, skipping authentication for api');
            return await handler(req, res, 'fake-access-token');
        }
        const authHeader = getAuthorizationHeader(req);
        if (!authHeader) {
            return res.status(401).json({ message: 'No token found in authorization header' });
        }

        const validationResult = await validateIdportenToken(authHeader);
        if (validationResult !== 'valid') {
            logger.info(
                `Failed to validate due to: ${validationResult.errorType} ${validationResult.message}`
            );
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const grantResult = await grantTokenXOboToken(extractToken(authHeader), audience);
        if (isInvalidTokenSet(grantResult)) {
            logger.error(`TokenX failed: ${grantResult.errorType} ${grantResult.message}`);
            return res.status(401).json({ message: 'Authentication failed' });
        }

        return handler(req, res, grantResult);
    };
}

export type TokenXError = 'NO_AUTH_HEADER_FOUND' | 'IDPORTEN_TOKEN_INVALID' | 'TOKENX_FAILED'
type TokenXResult =  TokenXError | string;

/**
 * Exchanges subject token found in the authorization header with a access token for a given audience.
 * If the subject token is not found, or the token exchange failed, `null` will be returned.
 */
export async function exchangeIdportenSubjectToken(
    request: IncomingMessage,
    audience: string,
    logger: Logger = console
): Promise<TokenXResult> {
    const authHeader = getAuthorizationHeader(request);

    if (!authHeader) {
        logger.info('No token not found in authorization header.');
        return 'NO_AUTH_HEADER_FOUND';
    }

    const validationResult = await validateIdportenToken(authHeader);
    if (validationResult !== 'valid') {
        logger.info(
            `Failed to validate due to: ${validationResult.errorType} ${validationResult.message}`
        );
        return 'IDPORTEN_TOKEN_INVALID';
    }

    const validSubjectToken = extractToken(authHeader);

    const grantResult = await grantTokenXOboToken(validSubjectToken, audience);
    if (isInvalidTokenSet(grantResult)) {
        logger.error(`TokenX failed: ${grantResult.errorType} ${grantResult.message}`);
        return 'TOKENX_FAILED';
    }

    return grantResult;
}

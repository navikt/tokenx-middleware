import { RequestHandler } from 'express';
import {
    extractSubjectToken,
    getAuthorizationHeader,
    setAuthorizationToken,
} from './header-utils.js';
import {
    grantTokenXOboToken,
    isInvalidTokenSet,
    validateIdportenToken,
} from '@navikt/next-auth-wonderwall';
import { Logger } from './logger.js';

export function idportenTokenXMiddleware(
    audience: string,
    logger: Logger = console
): RequestHandler {
    return async (req, _res, next) => {
        const authHeader = getAuthorizationHeader(req);
        if (!authHeader) {
            logger.info('Authorization header not found, returning');
            return;
        }

        const result = await validateIdportenToken(authHeader);
        if (result != 'valid') {
            logger.info('Invalid token found in authorization header');
            return;
        }

        const grantResult = await grantTokenXOboToken(extractSubjectToken(authHeader), audience);
        if (isInvalidTokenSet(grantResult)) {
            logger.error(JSON.stringify(grantResult));
            return;
        }

        setAuthorizationToken(req, grantResult);
        next();
    };
}

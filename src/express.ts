import {Request, RequestHandler} from 'express';
import { extractToken, getAuthorizationHeader, setAuthorizationHeader } from './header-utils.js';
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
    return async (req, res, next) => {
        await validateAndExchangeSubjectToken(req, audience, logger);
        next(); // next() must be called regardless of token exchange result
    };
}


async function validateAndExchangeSubjectToken(req: Request, audience: string, logger: Logger = console) {
    const authHeader = getAuthorizationHeader(req);
    if (!authHeader) {
        logger.info('Authorization header not found, returning');
        return;
    }

    const result = await validateIdportenToken(authHeader);
    if (result != 'valid') {
        logger.info('Invalid token found in authorization header, will not do token exchange');
        return;
    }

    const subjectToken = extractToken(authHeader);
    const grantResult = await grantTokenXOboToken(subjectToken, audience);
    if (isInvalidTokenSet(grantResult)) {
        logger.error(
            `Error in token exchange: ${grantResult.errorType} ${grantResult.message}`
        );
        return;
    }

    setAuthorizationHeader(req, grantResult);
}

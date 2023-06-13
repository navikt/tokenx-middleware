import { RequestHandler, Request } from 'express';
import { Logger } from './logger.js';
import { tokenExchange } from './tokenExchange.js';
import { validateIdportenSubjectToken } from './idporten.js';

export function idportenTokenXMiddleware(audience: string): RequestHandler {
    return async (req, _res, next) => {
        await exchangeIdportenSubjectToken(req, audience);
        next();
    };
}

async function exchangeIdportenSubjectToken(
    request: Request,
    audience: string,
    logger: Logger = console
): Promise<void> {
    const subjectToken = request.headers['authorization']?.split(' ')[1];

    if (!subjectToken) {
        return;
    }

    try {
        await validateIdportenSubjectToken(subjectToken);

        const tokenSet = await tokenExchange(subjectToken, audience);

        if (!tokenSet?.expired() && tokenSet?.access_token) {
            request.headers['authorization'] = `Bearer ${tokenSet.access_token}`;
        }
    } catch (error) {
        // Handle the error appropriately, e.g., log it or return an error response
        if (error instanceof Error) {
            logger.error('Error during token exchange:', error);
        } else {
            logger.error('Error during token exchange:', 'unknown reason');
        }
    }
}

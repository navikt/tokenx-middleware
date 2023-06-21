import { RequestHandler } from 'express';
import { exchangeIdportenSubjectToken } from './idporten';
import { setAuthorizationToken } from './header-utils';

export function idportenTokenXMiddleware(audience: string): RequestHandler {
    return async (req, _res, next) => {
        const accessToken = await exchangeIdportenSubjectToken(req, audience);

        if (accessToken) {
            setAuthorizationToken(req, accessToken);
        }
        next();
    };
}

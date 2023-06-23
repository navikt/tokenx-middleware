import { Request } from 'express';
import { Logger } from './logger.js';
import { extractSubjectToken, getAuthorizationHeader } from './header-utils.js';
import {
    grantTokenXOboToken,
    isInvalidTokenSet,
    validateIdportenToken,
} from '@navikt/next-auth-wonderwall';

export async function exchangeIdportenSubjectToken(
    request: Request,
    audience: string,
    logger: Logger = console
): Promise<string | undefined> {
    const authHeader = getAuthorizationHeader(request);
    if (!authHeader) {
        return;
    }

    const result = await validateIdportenToken(authHeader);
    if (result != 'valid') {
        return;
    }

    const grantResult = await grantTokenXOboToken(extractSubjectToken(authHeader), audience);
    if (isInvalidTokenSet(grantResult)) {
        logger.error(JSON.stringify(grantResult));
        return;
    }
}

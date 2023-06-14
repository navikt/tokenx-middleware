import { IncomingMessage } from 'http';
import { Logger } from './logger.js';
import { validateIdportenSubjectToken } from './idporten.js';
import { tokenExchange } from './tokenExchange.js';

export async function exchangeIdportenSubjectToken(
    request: IncomingMessage,
    audience: string,
    logger: Logger = console
): Promise<string | undefined> {
    const authorizationHeader = request.headers['authorization'];
    const subjectToken = authorizationHeader?.split(' ')[1];

    // return the original header if no subject token is found
    if (!subjectToken) {
        return authorizationHeader;
    }

    try {
        await validateIdportenSubjectToken(subjectToken);

        const tokenSet = await tokenExchange(subjectToken, audience);

        if (!tokenSet?.expired() && tokenSet?.access_token) {
            return `Bearer ${tokenSet.access_token}`;
        }
    } catch (error) {
        // Handle the error appropriately, e.g., log it or return an error response
        if (error instanceof Error) {
            logger.error('Error during token exchange:', error);
        } else {
            logger.error('Error during token exchange', 'Unknown reason');
        }
    }
}

import { IncomingMessage } from 'http';
import { Logger } from './logger.js';
import { validateIdportenSubjectToken } from './idporten.js';
import { exchangeToken } from './exchangeToken';

/**
 * Exchanges subject token found in the authorization header with a access token for a given audience.
 * If the subject token is not found, or the token exchange failed, `null` will be returned.
 */
export async function exchangeIdportenSubjectToken(
    request: IncomingMessage,
    audience?: string,
    logger: Logger = console
): Promise<string | null> {
    const authorizationHeader = request.headers['authorization'];
    const subjectToken = authorizationHeader?.split(' ')[1];

    // return the original header if no subject token is found
    if (!subjectToken) {
        logger.debug('Cannot exhange subject token because it was not found.');
        return null;
    }

    try {
        await validateIdportenSubjectToken(subjectToken);

        const tokenSet = await exchangeToken(subjectToken, audience);

        if (!tokenSet?.expired() && tokenSet?.access_token) {
            logger.debug('Returning valid access token');
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
    return null;
}

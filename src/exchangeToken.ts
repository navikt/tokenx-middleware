import { Client, Issuer, TokenSet } from 'openid-client';
import { Logger } from './logger.js';

let tokenxClient: Client;

const { TOKEN_X_WELL_KNOWN_URL, TOKEN_X_CLIENT_ID, TOKEN_X_PRIVATE_JWK } = process.env;

if (!TOKEN_X_WELL_KNOWN_URL || !TOKEN_X_CLIENT_ID || !TOKEN_X_PRIVATE_JWK) {
    throw new Error('One or more of the required environment variables are undefined');
}

export async function initTokenXClient(logger: Logger = console) {
    logger.debug(`Initializing TokenX client from ${TOKEN_X_WELL_KNOWN_URL}`);
    const tokenxIssuer = await Issuer.discover(TOKEN_X_WELL_KNOWN_URL as string);
    tokenxClient = new tokenxIssuer.Client(
        {
            client_id: TOKEN_X_CLIENT_ID as string,
            token_endpoint_auth_method: 'private_key_jwt',
        },
        {
            keys: [JSON.parse(TOKEN_X_PRIVATE_JWK as string)],
        }
    );
}

export async function exchangeToken(
    token: string,
    audience?: string,
    logger: Logger = console
): Promise<TokenSet | null> {
    if (!audience) {
        logger.error('Audience is required do perform token exchange, but was undefined.');
        return null;
    }

    if (!tokenxClient) {
        await initTokenXClient(logger);
    }

    return tokenxClient
        ?.grant(
            {
                grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
                audience: audience,
                subject_token: token,
            },
            {
                clientAssertionPayload: {
                    nbf: Math.floor(Date.now() / 1000),
                    // TokenX only allows a single audience
                    aud: [tokenxClient?.issuer.metadata.token_endpoint],
                },
            }
        )
        .catch((err: Error) => {
            logger.error('Token exchange failed', err);
            return null;
        });
}

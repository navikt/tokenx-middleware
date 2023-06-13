import { Client, Issuer, TokenSet } from 'openid-client';
import { Logger } from './logger.js';

let tokenxClient: Client;

const {
    TOKEN_X_WELL_KNOWN_URL = 'ENV_VAR_UNDEFINED',
    TOKEN_X_CLIENT_ID = 'ENV_VAR_UNDEFINED',
    TOKEN_X_PRIVATE_JWK = 'ENV_VAR_UNDEFINED',
} = process.env;

export async function initTokenXClient() {
    const tokenxIssuer = await Issuer.discover(TOKEN_X_WELL_KNOWN_URL);
    tokenxClient = new tokenxIssuer.Client(
        {
            client_id: TOKEN_X_CLIENT_ID,
            token_endpoint_auth_method: 'private_key_jwt',
        },
        {
            keys: [JSON.parse(TOKEN_X_PRIVATE_JWK)],
        }
    );
}

export async function tokenExchange(
    token: string,
    audience: string,
    logger: Logger = console
): Promise<TokenSet | null> {
    if (!tokenxClient) {
        await initTokenXClient();
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
            logger.error('Noe gikk galt med token exchange', err);
            return null;
        });
}

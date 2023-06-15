import { Issuer } from 'openid-client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
    FlattenedJWSInput,
    GetKeyFunction,
    JWSHeaderParameters,
    JWTPayload,
} from 'jose/dist/types/types';

const acceptedAcrLevels = ['Level4', 'idporten-loa-high'];
const acceptedSigningAlgorithm = 'RS256';

let idportenIssuer: Issuer;

type RemoteJWKSet = GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;
let signingKeys: RemoteJWKSet;

const { IDPORTEN_WELL_KNOWN_URL, IDPORTEN_CLIENT_ID } = process.env;

if (!IDPORTEN_WELL_KNOWN_URL || !IDPORTEN_CLIENT_ID) {
    throw new Error(
        'IDPORTEN_WELL_KNOWN_URL or IDPORTEN_CLIENT_ID is not defined in environment variables.'
    );
}

async function fetchIssuer() {
    const issuerUrl = process.env.IDPORTEN_WELL_KNOWN_URL;

    if (!idportenIssuer) {
        idportenIssuer = await Issuer.discover(issuerUrl as string);
    }
    return idportenIssuer;
}

async function fetchSigningKeys() {
    const issuer = await fetchIssuer();
    if (!signingKeys)
        signingKeys = createRemoteJWKSet(new URL(issuer.metadata.jwks_uri as string), {
            cooldownDuration: 86400000, // 1 dag
        });
    return signingKeys;
}

export async function validateIdportenSubjectToken(token: string | Uint8Array) {
    await fetchIssuer().catch((e) => {
        throw Error(`Contact with ID-Porten on url ${IDPORTEN_WELL_KNOWN_URL} failed: ${e}`);
    });

    await fetchSigningKeys().catch((e) => {
        throw Error(`Error in ID-porten metadata document: ${e}`);
    });

    await validateToken(token, idportenIssuer, signingKeys);
}

export async function validateToken(
    token: string | Uint8Array,
    idportenIssuer: Issuer,
    signingKeys: RemoteJWKSet
) {
    const { payload } = await jwtVerify(token, signingKeys, {
        algorithms: [acceptedSigningAlgorithm],
        issuer: idportenIssuer.metadata.issuer,
    });

    validatePayload(payload);
}

export function validatePayload(payload: JWTPayload) {
    if (payload.client_id !== IDPORTEN_CLIENT_ID) {
        throw new Error('Invalid client ID in token');
    }

    if (!acceptedAcrLevels.includes(payload.acr as string)) {
        throw new Error('Invalid ACR-level');
    }
}

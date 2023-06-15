import { Issuer } from 'openid-client';
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from 'jose';
import { GetKeyFunction, JWTPayload } from 'jose/dist/types/types';

const acceptedAcrLevels = ['Level4', 'idporten-loa-high'];
const acceptedSigningAlgorithm = 'RS256';

let idportenIssuer: Issuer;

type RemoteJWKSet = GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;
let _remoteJWKSet: RemoteJWKSet;

const { IDPORTEN_WELL_KNOWN_URL, IDPORTEN_CLIENT_ID } = process.env;

if (!IDPORTEN_WELL_KNOWN_URL || !IDPORTEN_CLIENT_ID) {
    throw new Error(
        'IDPORTEN_WELL_KNOWN_URL or IDPORTEN_CLIENT_ID is not defined in environment variables.'
    );
}

async function initIdportenIssuer() {
    idportenIssuer = await Issuer.discover(IDPORTEN_WELL_KNOWN_URL as string);
    if (idportenIssuer.metadata.jwks_uri) {
        _remoteJWKSet = createRemoteJWKSet(new URL(idportenIssuer.metadata.jwks_uri));
    } else {
        throw Error('idportenIssuer.metadata.jwks_uri not found');
    }
}

export async function validateToken(
    token: string | Uint8Array,
    idportenIssuer: Issuer,
    keystore: RemoteJWKSet
) {
    const { payload } = await jwtVerify(token, keystore, {
        algorithms: [acceptedSigningAlgorithm],
        issuer: idportenIssuer.metadata.issuer,
    });

    validatePayload(payload);
}

export async function validateIdportenSubjectToken(token: string | Uint8Array) {
    if (!idportenIssuer || !_remoteJWKSet) {
        await initIdportenIssuer();
    }

    await validateToken(token, idportenIssuer, _remoteJWKSet);
}

export function validatePayload(payload: JWTPayload) {
    if (payload.client_id !== IDPORTEN_CLIENT_ID) {
        throw new Error('Invalid client ID in token');
    }

    if (!acceptedAcrLevels.includes(payload.acr as string)) {
        throw new Error('Invalid ACR-level');
    }
}

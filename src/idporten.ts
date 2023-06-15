import { Issuer } from 'openid-client';
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from 'jose';
import { GetKeyFunction, JWTPayload } from 'jose/dist/types/types';

const acceptedAcrLevels = ['Level4', 'idporten-loa-high'];
const acceptedSigningAlgorithm = 'RS256';

let idportenIssuer: Issuer;
let _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

const { IDPORTEN_WELL_KNOWN_URL = 'ENV_VAR_UNDEFINED', IDPORTEN_CLIENT_ID = 'ENV_VAR_UNDEFINED' } =
    process.env;

async function initIdportenIssuer() {
    idportenIssuer = await Issuer.discover(IDPORTEN_WELL_KNOWN_URL);
    if (idportenIssuer.metadata.jwks_uri) {
        _remoteJWKSet = createRemoteJWKSet(new URL(idportenIssuer.metadata.jwks_uri));
    } else {
        throw Error('idportenIssuer.metadata.jwks_uri not found');
    }
}

export async function validateIdportenSubjectToken(token: string | Uint8Array) {
    if (!idportenIssuer || !_remoteJWKSet) {
        await initIdportenIssuer();
    }

    const { payload } = await jwtVerify(token, _remoteJWKSet, {
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
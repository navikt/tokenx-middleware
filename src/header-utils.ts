import { IncomingMessage } from 'http';

export function getAuthorizationHeader(request: IncomingMessage): string | undefined {
    return request.headers['authorization'];
}

export function extractSubjectToken(bearerToken: string) {
    return bearerToken.replace('Bearer ', '');
}

export function setAuthorizationToken(request: IncomingMessage, accessToken: string): void {
    request.headers['authorization'] = `Bearer ${accessToken}`;
}

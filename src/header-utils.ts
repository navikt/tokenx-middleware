import { IncomingMessage } from 'http';

export function getAuthorizationHeader(request: IncomingMessage): string | undefined {
    return request.headers['authorization'];
}

export function extractToken(bearerToken: string) {
    return bearerToken.replace('Bearer ', '');
}

export function setAuthorizationHeader(request: IncomingMessage, accessToken: string): void {
    request.headers['authorization'] = `Bearer ${accessToken}`;
}

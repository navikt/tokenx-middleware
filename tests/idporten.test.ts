import 'jest';
import { validatePayload } from '../src/idporten';

describe('Payload validation', () => {
    const dummyPayload = {
        client_id: 'dummyIdportenClientId',
        acr: 'Level4',
    };

    it('accepts dummy token', () => {
        expect(() => validatePayload(dummyPayload)).not.toThrowError();
        expect(() =>
            validatePayload({
                ...dummyPayload,
                acr: 'idporten-loa-high',
            })
        ).not.toThrowError();
    });

    it('throws invalid ID error', () => {
        expect(() =>
            validatePayload({
                ...dummyPayload,
                client_id: 'wrongClientID',
            })
        ).toThrow('Invalid client ID in token');
    });

    it('throws ACR-level error', () => {
        expect(() =>
            validatePayload({
                ...dummyPayload,
                acr: 'wrongACRLevel',
            })
        ).toThrow('Invalid ACR-level');
    });
});

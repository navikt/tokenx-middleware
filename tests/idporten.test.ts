import 'jest';

import {validatePayload} from '../src/idporten';

describe('Payload validation', () => {
    const dumyPayload = {
        client_id: 'dummyIdportenClientId',
        acr: 'Level4'
    }
    it('accepts dummy token', () => {
        expect(() => validatePayload(dumyPayload)).not.toThrowError();
        expect(() => validatePayload({...dumyPayload, acr: 'idporten-loa-high'})).not.toThrowError();
    })
    it('throws invalid ID error', () => {
        expect(() => validatePayload({...dumyPayload, client_id: 'wrongClientID'})).toThrow('Invalid client ID in token');
    })
    it('throws ACR-level error', () => {
        expect(() => validatePayload({...dumyPayload, acr: 'wrongACRLevel'})).toThrow('Invalid ACR-level');
    })
});
import 'jest';

describe('Jest is working', () => {
    it('1+1', () => {
        const onePlusOneResult = 1 + 1;
        expect(onePlusOneResult).toBe(2);
    })

    it('Jest gets env variables from setEnvVars.js', () => {
        const dummyEnvVariable = process.env.JEST_GETS_ENV_VARIABLES;

        expect(dummyEnvVariable).toBe('JEST_GETS_ENV_VARIABLES');
    })
})
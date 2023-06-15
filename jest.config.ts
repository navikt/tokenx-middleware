/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testEnvironment: 'node',
    preset: 'ts-jest',

    // Automatically clear mock calls, instances, contexts and results before every test
    clearMocks: true,

    // Indicates which provider should be used to instrument code for coverage
    coverageProvider: 'v8',
};

module.exports = {
    preset: 'jest-expo',

    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],

    moduleNameMapper: {
        '\\.(css|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',

        '^@/assets/(.*)$': '<rootDir>/assets/$1',

        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    setupFiles: ['<rootDir>/src/utils/dom/__tests__/setup.ts']
}; 
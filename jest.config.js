module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['/build/'],
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[tj]s?(x)'],
};

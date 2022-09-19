/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  
  clearMocks: true,
  modulePathIgnorePatterns: [
    'src/templates',
  ],
  collectCoverageFrom: [
    'src/**/*',
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    }
  },
  moduleFileExtensions: [
    "js",
    "ts",
  ],
  testMatch: [
    "**/*.spec.ts",
  ],
};
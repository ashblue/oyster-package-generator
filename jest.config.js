module.exports = {
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
  testEnvironment: "node",
  testMatch: [
    "**/*.spec.ts",
  ],
  transform: {
    '\\.ts$': 'ts-jest',
  },
};

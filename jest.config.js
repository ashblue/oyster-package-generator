module.exports = {
  clearMocks: true,
  modulePathIgnorePatterns: [
    'src/commands/install/templates',
  ],
  collectCoverageFrom: [
    'src/**/*',
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 84,
      functions: 95,
      lines: 96,
      statements: 96,
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

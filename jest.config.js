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
      branches: 78,
      functions: 86,
      lines: 82,
      statements: 82,
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

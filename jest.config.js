module.exports = {
  clearMocks: true,
  modulePathIgnorePatterns: [
    'src/templates',
  ],
  collectCoverageFrom: [
    'src/**/*',
  ],
  coverageDirectory: "dist/coverage",
  coverageThreshold: {
    global: {
      branches: 78,
      functions: 80,
      lines: 80,
      statements: 80,
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

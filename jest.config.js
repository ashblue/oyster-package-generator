module.exports = {
  clearMocks: true,
  coverageDirectory: "dist/coverage",
  moduleFileExtensions: [
    "js",
    "ts",
    "tsx"
  ],
  testEnvironment: "node",
  testMatch: [
    "**/*.spec.ts",
  ],
  transform: {
    '\\.ts$': 'ts-jest',
  },
};

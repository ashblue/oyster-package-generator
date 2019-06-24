module.exports = {
  clearMocks: true,
  coverageDirectory: "dist/coverage",
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    }
  },
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

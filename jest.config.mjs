export default {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { isolatedModules: true }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@faker-js/faker)/)'],
  collectCoverageFrom: ['server/**/*.{ts,js,jsx,mjs}'],
  coveragePathIgnorePatterns: ['@types'],
  coverageReporters: ['text', 'html'],
  testMatch: ['<rootDir>/(server|job)/**/?(*.)(spec|test).{ts,js,jsx,mjs}'],
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test_results/jest/',
      },
    ],
    [
      './node_modules/jest-html-reporter',
      {
        outputPath: 'test_results/unit-test-reports.html',
      },
    ],
  ],
  moduleFileExtensions: ['web.js', 'js', 'json', 'node', 'ts'],
  resetMocks: true,
}

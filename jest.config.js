// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/unit/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  verbose: true,
  // Comenta esta línea si existe
  // setupFilesAfterEnv: ['./test/setup.js']
};
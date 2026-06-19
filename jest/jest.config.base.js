// Shared jest config for every block in this recipe bundle.
//
// Self-contained: the FY blocks import `@wpmedia/arc-themes-components` and
// `@arc-fusion/prop-types` (published to a private GitHub registry) and Fusion's
// virtual `fusion:*` modules. None are installed here — they are resolved to the
// local mocks under jest/mocks/ via moduleNameMapper, so `npm test` runs without
// registry access. Paths are absolute (__dirname-based) so this base works
// whether jest runs from the repo root or from inside an individual block.
const path = require('path');

const mocks = path.join(__dirname, 'mocks');

module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: [path.join(__dirname, 'testSetupFile.js')],
  moduleNameMapper: {
    '^fusion:context$': path.join(mocks, 'fusion-context.js'),
    '^fusion:environment$': path.join(mocks, 'fusion-environment.js'),
    '^fusion:content$': path.join(mocks, 'fusion-content.js'),
    '^fusion:properties$': path.join(mocks, 'fusion-properties.js'),
    '^@arc-fusion/prop-types$': path.join(mocks, 'arc-fusion-prop-types.js'),
    '^@wpmedia/arc-themes-components$': path.join(mocks, 'arc-themes-components.js'),
  },
};

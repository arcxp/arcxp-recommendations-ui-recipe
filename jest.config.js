// Root jest config for the recipe bundle. Runs every block's tests from the
// repo root (`npm test`). Per-block jest.config.js files reuse the same shared
// base, so `jest` can also be run from within an individual block directory.
const base = require('./jest/jest.config.base');

module.exports = {
  ...base,
  rootDir: '.',
  roots: ['<rootDir>/blocks'],
};

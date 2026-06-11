// Mock of Fusion's virtual `fusion:context` module. Tests override these via
// inline `jest.mock("fusion:context", ...)` factories where they need specific
// globalContent / arcSite values.
const useFusionContext = jest.fn(() => ({
  globalContent: null,
  arcSite: 'test-site',
  isAdmin: false,
  siteProperties: {},
}));

const useComponentContext = jest.fn(() => ({ id: 'test-component-id' }));

module.exports = { useFusionContext, useComponentContext };

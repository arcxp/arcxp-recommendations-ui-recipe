// Mock of Fusion's virtual `fusion:properties` module (default export is
// `getProperties(siteName)`). Tests override the return value via inline
// `jest.mock("fusion:properties", ...)` factories where they need specific
// site properties (e.g. fyRecommenderOrg / fyRecommenderApiKey).
const getProperties = jest.fn(() => ({}));

module.exports = { __esModule: true, default: getProperties };

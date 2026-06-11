// Mock of Fusion's virtual `fusion:environment` module. Operators set these in
// the real engine bundle (see the bundle environment variable reference in the
// root README). Tests override them via inline `jest.mock` where needed.
module.exports = {
  FY_RECOMMENDER_BASE: 'https://recommender.test.arcxp.com',
  ORGANIZATION: 'test-org',
};

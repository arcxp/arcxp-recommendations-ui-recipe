// Minimal jest mock of @arc-fusion/prop-types.
//
// Supports the chainable `.tag(...)`, `.isRequired`, `PropTypes.shape(...)`,
// and `PropTypes.oneOf(...)` surface the FY block relies on. PageBuilder
// custom-field metadata is irrelevant at test time, so tags are no-ops.
const makePropType = () => {
  const pt = {};
  pt.tag = () => pt;
  pt.isRequired = pt;
  return pt;
};

const shape = () => makePropType();
const oneOf = () => makePropType();
const contentConfig = () => makePropType();

module.exports = {
  shape,
  oneOf,
  contentConfig,
  string: makePropType(),
  number: makePropType(),
  bool: makePropType(),
};

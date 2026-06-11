// Mock of Fusion's virtual `fusion:content` module. Not used by the FY blocks
// today; provided so the moduleNameMapper entry always resolves.
const useContent = jest.fn(() => null);
const useEditableContent = jest.fn(() => ({ editableContent: () => ({}) }));

module.exports = { useContent, useEditableContent };

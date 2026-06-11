import '@testing-library/jest-dom';

// Provide MessageChannel in Jest if missing (React's scheduler expects it).
if (typeof global.MessageChannel === 'undefined') {
  try {
    // eslint-disable-next-line global-require
    const { MessageChannel } = require('node:worker_threads');
    global.MessageChannel = MessageChannel;
  } catch {
    // Leave undefined if truly unavailable.
  }
}

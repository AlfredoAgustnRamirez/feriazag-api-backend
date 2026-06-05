// Configuración simple de logger
const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[INFO]', ...args);
    }
  },
  error: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[ERROR]', ...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

module.exports = logger;
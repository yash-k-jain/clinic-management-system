// src/utils/logger.js
import log from "loglevel";

// Set default level (can be: trace, debug, info, warn, error, silent)
log.setLevel("info");

// Optional: Prefix timestamps
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    const timestamp = new Date().toISOString();
    rawMethod(`[${timestamp}]`, ...args);
  };
};
log.setLevel(log.getLevel()); // Apply methodFactory

export default log;

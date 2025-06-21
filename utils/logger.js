const fs = require("fs");
const util = require("util");

function log({
  level = "INFO",
  logTo = "file",
  filename = "log.txt",
  condition = () => true,
  structured = true,
  profile = false,
  formatter = null,
} = {}) {
  const levels = ["DEBUG", "INFO", "ERROR"];

  return function (target, key, descriptor) {
    // const originalFn = descriptor.value; error
    // const isAsync = originalFn.constructor.name === 'AsyncFunction';
    // descriptor.value = function (...args) {
    //   const start = Date.now();
    //   const timestamp = new Date().toISOString();
    //   const logEntry = (type, data) => {
    //     if (!levels.includes(level) || !condition(type, data)) return;
    //     const base = {
    //       timestamp,
    //       level: type,
    //       function: key,
    //       arguments: args,
    //       ...data,
    //     };
    //     const logLine = formatter
    //       ? formatter(base)
    //       : structured
    //       ? JSON.stringify(base)
    //       : `[${timestamp}] [${type}] ${key}(${args.map(a => util.inspect(a)).join(', ')}) => ${data.result}`;
    //     if (logTo === 'console') {
    //       console.log(logLine);
    //     } else if (logTo === 'file') {
    //       fs.appendFileSync(filename, logLine + '\n');
    //     } else if (typeof logTo === 'function') {
    //       logTo(base);
    //     }
    //   };
    //   const handleResult = (result) => {
    //     const duration = Date.now() - start;
    //     if (level !== 'ERROR') {
    //       logEntry(level, { result, duration });
    //     }
    //     return result;
    //   };
    //   const handleError = (error) => {
    //     const duration = Date.now() - start;
    //     logEntry('ERROR', { error: error.message, stack: error.stack, duration });
    //     throw error;
    //   };
    //   try {
    //     const result = originalFn.apply(this, args);
    //     return isAsync
    //       ? result.then(handleResult).catch(handleError)
    //       : handleResult(result);
    //   } catch (err) {
    //     return handleError(err);
    //   }
    // };
    // return descriptor;
  };

  // end
}

module.exports = { log };
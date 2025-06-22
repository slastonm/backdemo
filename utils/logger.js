const fs = require("fs");
const path = require("path");

function log({
  level = "INFO",
  logTo = "console", // "console" | "file"
  filename = "log.txt",
  condition = () => true,
  structured = false,
  profile = false,
  formatter = null,
} = {}) {
  const levels = ["DEBUG", "INFO", "ERROR"];
  const shouldLog = (lvl) => levels.indexOf(lvl) >= levels.indexOf(level);

  const logEntry = (entry) => {
    if (!shouldLog(entry.level) || !condition(entry.level, entry)) return;
    const timestamp = new Date().toISOString();
    const base = {
      timestamp,
      level: entry.level,
      function: entry.function,
      arguments: entry.args,
      result: entry.result,
      duration: entry.duration,
    };
    const formatted = formatter
      ? formatter(base)
      : structured
      ? JSON.stringify(base)
      : `\${timestamp} [\${entry.level}] \${entry.function} - args: \${JSON.stringify(entry.args)} result: \${JSON.stringify(entry.result)}`;

    if (logTo === "file") {
      fs.appendFileSync(
        path.join(__dirname, "..", "logs", filename),
        formatted + "\n"
      );
    } else {
      console.log(formatted);
    }
  };

  return function (target, key, descriptor) {
    const original = descriptor.value;
    const isAsync = original.constructor.name === "AsyncFunction";

    descriptor.value = function (...args) {
      const start = Date.now();
      try {
        const result = original.apply(this, args);
        if (isAsync) {
          return result.then((res) => {
            if (shouldLog(level)) {
              logEntry({
                level,
                function: key,
                args,
                result: res,
                duration: profile ? Date.now() - start : undefined,
              });
            }
            return res;
          });
        } else {
          if (shouldLog(level)) {
            logEntry({
              level,
              function: key,
              args,
              result,
              duration: profile ? Date.now() - start : undefined,
            });
          }
          return result;
        }
      } catch (error) {
        logEntry({
          level: "ERROR",
          function: key,
          args,
          result: error.message,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

module.exports = { log };

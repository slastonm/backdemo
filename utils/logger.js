const fs = require("fs");
const path = require("path");

function log({
  level = "INFO",
  logTo = "console", // "console" | "file" | "external"
  filename = "log.txt",
  condition = () => true,
  structured = false,
  profile = false,
  formatter = null,
  externalService = null, // function for external logging
} = {}) {
  const levels = { DEBUG: 0, INFO: 1, ERROR: 2 };
  const shouldLog = (lvl) => levels[lvl] >= levels[level];

  const ensureLogDir = () => {
    if (logTo === "file") {
      const logDir = path.join(__dirname, "..", "logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  };

  const logEntry = async (entry) => {
    if (!shouldLog(entry.level) || !condition(entry.level, entry)) return;

    const timestamp = new Date().toISOString();
    const base = {
      timestamp,
      level: entry.level,
      function: entry.function,
      arguments: entry.args,
      result: entry.result,
      ...(entry.duration !== undefined && { duration: `${entry.duration}ms` }),
      ...(entry.error && { error: entry.error }),
    };

    const formatted = formatter
      ? formatter(base)
      : structured
      ? JSON.stringify(base, null, 2)
      : `${timestamp} [${entry.level}] ${
          entry.function
        } - args: ${JSON.stringify(entry.args)} result: ${JSON.stringify(
          entry.result
        )}${entry.duration ? ` (${entry.duration}ms)` : ""}`;

    switch (logTo) {
      case "file":
        ensureLogDir();
        fs.appendFileSync(
          path.join(__dirname, "..", "logs", filename),
          formatted + "\n"
        );
        break;
      case "external":
        if (externalService && typeof externalService === "function") {
          try {
            await externalService(base);
          } catch (err) {
            console.error("service failed:", err.message);

            console.log(formatted);
          }
        } else {
          console.warn("service not configured, falling back to console");
          console.log(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  };

  return function (target, key, descriptor) {
    const original = descriptor.value;
    const isAsync = original.constructor.name === "AsyncFunction";

    descriptor.value = function (...args) {
      const start = profile ? Date.now() : null;

      try {
        const result = original.apply(this, args);

        if (isAsync) {
          return result
            .then(async (res) => {
              if (shouldLog(level)) {
                await logEntry({
                  level,
                  function: key,
                  args,
                  result: res,
                  duration: start ? Date.now() - start : undefined,
                });
              }
              return res;
            })
            .catch(async (error) => {
              await logEntry({
                level: "ERROR",
                function: key,
                args,
                result: null,
                error: error.message,
                duration: start ? Date.now() - start : undefined,
              });
              throw error;
            });
        } else {
          if (shouldLog(level)) {
            logEntry({
              level,
              function: key,
              args,
              result,
              duration: start ? Date.now() - start : undefined,
            });
          }
          return result;
        }
      } catch (error) {
        logEntry({
          level: "ERROR",
          function: key,
          args,
          result: null,
          error: error.message,
          duration: start ? Date.now() - start : undefined,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

module.exports = { log };

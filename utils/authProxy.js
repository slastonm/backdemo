class AuthProxy {
  constructor(config = {}) {
    this.config = {
      type: "Bearer", // 'Bearer', 'APIKey', 'JWT', 'OAuth'
      token: "",
      apiKey: "",
      clientId: "",
      clientSecret: "",
      authHeader: "Authorization",
      baseURL: "",
      rateLimitRequests: 100,
      rateLimitWindow: 60000, // 1 minute
      enableTokenRenewal: false,
      tokenRenewalEndpoint: "",
      logRequests: true,
      ...config,
    };

    this.requestCounts = new Map();
    this.tokenExpiry = null;

    this.requestLog = [];
  }

  async fetch(url, options = {}) {
    try {
      if (!this.checkRateLimit()) {
        throw new Error("Rate limit exceeded");
      }
      if (this.config.enableTokenRenewal && this.isTokenExpired()) {
        await this.renewToken();
      }

      const requestUrl = this.config.baseURL
        ? `${this.config.baseURL}${url}`
        : url;
      const requestOptions = await this.injectAuthentication(options);

      if (this.config.logRequests) {
        this.logRequest(requestUrl, requestOptions);
      }

      const response = await fetch(requestUrl, requestOptions);

      if (this.config.logRequests) {
        this.logResponse(response);
      }

      return response;
    } catch (error) {
      if (this.config.logRequests) {
        this.logError(error);
      }
      throw error;
    }
  }
  async injectAuthentication(options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    switch (this.config.type) {
      case "Bearer":
        if (this.config.token) {
          headers[this.config.authHeader] = `Bearer ${this.config.token}`;
        }
        break;

      case "APIKey":
        if (this.config.apiKey) {
          headers["X-API-Key"] = this.config.apiKey;
        }
        break;

      case "JWT":
        if (this.config.token) {
          headers[this.config.authHeader] = this.config.token;
        }
        break;

      case "OAuth":
        if (this.config.token) {
          headers[this.config.authHeader] = `Bearer ${this.config.token}`;
        }
        break;

      case "Basic":
        if (this.config.clientId && this.config.clientSecret) {
          const credentials = Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`
          ).toString("base64");
          headers[this.config.authHeader] = `Basic ${credentials}`;
        }
        break;
    }

    return {
      ...options,
      headers,
    };
  }

  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;

    // Clean old entries
    for (const [timestamp] of this.requestCounts) {
      if (timestamp < windowStart) {
        this.requestCounts.delete(timestamp);
      }
    }

    if (this.requestCounts.size >= this.config.rateLimitRequests) {
      return false;
    }

    this.requestCounts.set(now, true);
    return true;
  }

  async renewToken() {
    if (!this.config.tokenRenewalEndpoint) {
      throw new Error("Token renewal endpoint not configured");
    }

    try {
      const response = await fetch(this.config.tokenRenewalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error(`Token renewal failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.config.token = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      this.log("Token renewed successfully");
    } catch (error) {
      this.log(`Token renewal failed: ${error.message}`, "error");
      throw error;
    }
  }

  isTokenExpired() {
    return this.tokenExpiry && Date.now() >= this.tokenExpiry;
  }

  switchAuthStrategy(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log(`Authentication strategy switched to: ${this.config.type}`);
  }

  logRequest(url, options) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: "request",
      url,
      method: options.method || "GET",
      headers: { ...options.headers },
      authType: this.config.type,
    };
    if (logEntry.headers[this.config.authHeader]) {
      logEntry.headers[this.config.authHeader] = "[REDACTED]";
    }
    if (logEntry.headers["X-API-Key"]) {
      logEntry.headers["X-API-Key"] = "[REDACTED]";
    }

    this.requestLog.push(logEntry);
    this.log(`Request: ${options.method || "GET"} ${url}`);
  }

  logResponse(response) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: "response",
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };

    this.requestLog.push(logEntry);
    this.log(`Response: ${response.status} ${response.statusText}`);
  }

  logError(error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: "error",
      message: error.message,
      stack: error.stack,
    };

    this.requestLog.push(logEntry);
    this.log(`Error: ${error.message}`, "error");
  }

  log(message, level = "info") {
    if (this.config.logRequests) {
      console.log(`[AuthProxy:${level.toUpperCase()}] ${message}`);
    }
  }

  getLogs(type = null) {
    if (type) {
      return this.requestLog.filter((log) => log.type === type);
    }
    return this.requestLog;
  }

  clearLogs() {
    this.requestLog = [];
  }

  getRateLimitStatus() {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    const activeRequests = Array.from(this.requestCounts.keys()).filter(
      (timestamp) => timestamp >= windowStart
    );

    return {
      remaining: Math.max(
        0,
        this.config.rateLimitRequests - activeRequests.length
      ),
      total: this.config.rateLimitRequests,
      resetTime: windowStart + this.config.rateLimitWindow,
    };
  }
}

function createAuthProxy(config = {}) {
  return new AuthProxy(config);
}

function createSimpleAuthProxy({
  type = "Bearer",
  token = "",
  apiKey = "",
  authHeader = "Authorization",
} = {}) {
  const proxy = new AuthProxy({ type, token, apiKey, authHeader });
  return proxy.fetch.bind(proxy);
}

module.exports = {
  AuthProxy,
  createAuthProxy,
  createSimpleAuthProxy,
};

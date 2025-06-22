function proxyAuthMiddleware(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  req.token = token;
  next();
}

module.exports = proxyAuthMiddleware;

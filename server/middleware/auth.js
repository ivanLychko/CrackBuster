const basicAuth = require('express-basic-auth');

const authMiddleware = basicAuth({
  users: {
    [process.env.ADMIN_USERNAME || 'admin']: process.env.ADMIN_PASSWORD || 'admin123'
  },
  challenge: true,
  realm: 'CrackBuster Admin'
});

module.exports = authMiddleware;












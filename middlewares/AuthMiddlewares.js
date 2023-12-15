const { verify } = require('jsonwebtoken');

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) {
    return res.json({ error: 'User not logged in!' });
  } else {
    try {
      const validToken = verify(accessToken, "mindscapeprojectkeysecret");

      if (validToken) {
        return next();
      }
    } catch (err) {
      // Log the detailed error for debugging purposes
      console.error('Token verification error:', err);

      // Provide a user-friendly error message
      return res.json({ error: 'Invalid or expired token' });
    }
  }
};

module.exports = { validateToken };

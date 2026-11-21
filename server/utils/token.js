const jwt = require('jsonwebtoken');

// A JWT has three Base64URL parts joined by dots:  header.payload.signature
//   header    {"alg":"HS256","typ":"JWT"}              how the token is signed
//   payload   {"sub":"<userId>","iat":...,"exp":...}   who it is for and when it expires
//   signature HMAC-SHA256(header + "." + payload, JWT_SECRET)
// The signature lets the server detect any change to the header or payload.

const ALGORITHM = 'HS256';

// "sub" (subject) holds the user id. Nothing sensitive goes in the payload,
// because anyone can decode it (it is encoded, not encrypted).
const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// Throws if the signature is wrong or the token has expired.
// Pinning the algorithm stops attackers from switching it (for example to "none").
const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITHM] });

module.exports = { signToken, verifyToken };

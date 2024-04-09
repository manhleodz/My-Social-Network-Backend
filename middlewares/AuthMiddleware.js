const { verify } = require("jsonwebtoken");
require('dotenv').config();


const validateToken = (req, res, next) => {

  try {

    const accessToken = req.header("accessToken") || req.header("comfirmToken");

    if (!accessToken) return res.status(400).json({ error: "User not logged in!" });

    try {
      const validToken = verify(accessToken, process.env.SECRET_KEY);
      req.user = validToken;
      if (validToken) {
        return next();
      }
    } catch (err) {
      return res.status(400).json("User not logged in!");
    }

  } catch (error) {
    res.status(400).json("Lỗi server");
  }
};

module.exports = { validateToken };
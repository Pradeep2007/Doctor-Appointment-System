const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE ===");
    console.log("Headers:", req.headers);
    
    const token = req.headers["authorization"]?.split(" ")[1];
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    console.log("Token received, verifying...");
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        console.error("Token verification error:", err.message);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).send({
            success: false,
            message: "Token expired",
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).send({
            success: false,
            message: "Invalid token",
          });
        }
        
        return res.status(401).send({
          success: false,
          message: "Authentication failed",
        });
      }
      
      console.log("Token verified, user ID:", decode.id);
      req.user = { userId: decode.id };
      next();
    });
    
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).send({
      success: false,
      message: "Auth middleware error",
    });
  }
};
const express = require('express');
const cookieParser = require('cookie-parser');
const router = require('./router');
require('dotenv').config();

const app = express();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://thiagopecorariclemen1765331954009.0772072.meusitehostgator.com.br",
  "https://real-estate-system-pink.vercel.app/",
  "https://real-estate-system-3988fqou3-thiago-pecorari-clementes-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "X-File-Name, Content-Disposition");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cookieParser());
app.use(express.json());
app.use("/api", router);

module.exports = app;

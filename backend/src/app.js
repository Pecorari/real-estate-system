const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');

require('dotenv').config();

const app = express();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://real-estate-system-pink.vercel.app",
  "https://0896651eda5c.ngrok-free.app"
];

app.use(cors({
  // origin: process.env.BASE_URL,
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  exposedHeaders: ["X-File-Name", "Content-Disposition"]
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api', router);

module.exports = app;

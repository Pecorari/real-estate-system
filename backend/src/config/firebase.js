const admin = require("firebase-admin");
const firabaseKey = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-key.json")),
  storageBucket: `${firabaseKey.project_id}.firebasestorage.app`
});

const bucket = admin.storage().bucket();

module.exports = { bucket };

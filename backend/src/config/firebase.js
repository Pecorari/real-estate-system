const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: `${process.env.FIREBASE_PROJECTID}.firebasestorage.app`,
  });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };

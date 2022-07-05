// import firebase functions library
const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");
// import firebase storage library
const storage = admin.storage();

exports.getTemporaryFiles = functions
    .region("asia-east2")
    .https
    .onCall(async (data, context) => {
      // get files in temporary folder
      const bucket = storage.bucket();
      return bucket.getFiles({prefix: "temporary_files/"});
    });

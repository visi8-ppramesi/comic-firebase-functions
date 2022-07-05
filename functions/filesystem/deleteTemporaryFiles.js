// import firebase functions library
const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");
// import firebase storage library
const storage = admin.storage();

exports.deleteTemporaryFiles = functions
    .region("asia-east2")
    .pubsub.schedule("every 24 hours").onRun(async (context) => {
      // check if there are files in temporary folder
      storage;
      const bucket = storage.bucket();
      const files = await bucket.getFiles({prefix: "temporary_files/"});
      if (files.length > 0) {
        // delete all files in temporary folder
        const promises = files.map((file) => {
          return file.delete();
        });
        await Promise.all(promises);
      }
      return {
        message: "Temporary files deleted",
      };
    });

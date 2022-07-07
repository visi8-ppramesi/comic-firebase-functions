// import firebase functions library
const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");
// import firebase storage library
const storage = admin.storage();
const db = admin.firestore();

exports.moveTemporaryFile = functions
    .region("asia-east2")
    .https
    .onCall(async (data, context) => {
      // check if user is an admin
      const roles = (await db.collection("user_roles").doc(context.auth.uid).get()).get("roles");
      if (!context.auth || !roles.includes("admin")) {
        // user not authorized
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
      }
      const {temporaryId} = data;
      const tempFile = await db.collection("temporary_files").doc(temporaryId).get();
      if (tempFile.exists) {
        const {temporary_path: temporaryPath, move_path: movePath} = tempFile.data();
        const bucket = storage.bucket();
        const file = bucket.file(temporaryPath);
        const movePromise = file.move(movePath);
        const deletePromise = db.collection("temporary_files").doc(temporaryId).delete();
        return Promise.all([movePromise, deletePromise]).then(([movePromiseResult, deletePromiseResult]) => {
          return {
            path: movePath,
            move_promise_result: movePromiseResult,
            delete_promise_result: deletePromiseResult,
          };
        }).catch((err) => {
          return {
            path: movePath,
            err: err,
          };
        });
        // await file.move(movePath);
        // await db.collection("temporary_files").doc(temporaryId).delete();
      } else {
        throw new functions.https.HttpsError("invalid-argument", "File does not exist");
      }
    },
    );

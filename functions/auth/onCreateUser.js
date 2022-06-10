const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onCreateUser = functions
    .region("asia-east2")
    .auth
    .user()
    .onCreate((user) => {
      const uid = user.uid;
      db.collection("user_roles").doc(uid).set({roles: ["user"]});
      return db.collection("users")
          .doc(uid)
          .set({email_verified_at: null}, {merge: true});
    });

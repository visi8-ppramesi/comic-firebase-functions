const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onDeleteUser = functions
    .region("asia-east2")
    .auth
    .user()
    .onDelete((user) => {
      const uid = user.uid;
      db.collection("user_roles").doc(uid).delete();
      return db.collection("users").doc(uid).delete();
    });

const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onDeleteUser = functions
    .region("asia-east2")
    .auth
    .user()
    .onDelete((user) => {
      const uid = user.uid;
      const userRolesDeletePromise = db.collection("user_roles").doc(uid).delete();
      const userDeletePromise = db.collection("users").doc(uid).delete();
      const counterUpdate = db.collection("settings").doc("user_counter")
          .update({value: admin.firestore.FieldValue.increment(-1)});
      return Promise.all([userRolesDeletePromise, userDeletePromise, counterUpdate]);
    });

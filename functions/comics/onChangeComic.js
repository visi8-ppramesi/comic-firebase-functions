const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onCreateComic = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}")
    // eslint-disable-next-line no-unused-vars
    .onCreate((snap, context) => {
      return db.runTransaction((transaction) => {
        for (let k = 0; k < 10; k++) {
          const ref = db.collection("comics")
              .doc(context.params.comicId)
              .collection("counters")
              .doc(k.toString());
          transaction.set(ref, {
            view_count: 0,
          });
        }
      });
    });

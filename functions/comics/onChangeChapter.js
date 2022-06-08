const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onUpdateChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapter/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onUpdate((snap, context) => {
      const comicId = context.params.comicId;
      db.collection("comics")
          .doc(comicId)
          .update({
            last_update: new Date(),
          });
    });

exports.onCreateChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapter/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onCreate((snap, context) => {
      const comicId = context.params.comicId;
      db.collection("comics")
          .doc(comicId)
          .update({
            last_update: new Date(),
          });
    });

exports.onDeleteChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapter/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onDelete((snap, context) => {
      const comicId = context.params.comicId;
      db.collection("comics")
          .doc(comicId)
          .update({
            last_update: new Date(),
          });
    });

const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onUpdateChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapters/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onUpdate((snap, context) => {
      const comicId = context.params.comicId;
      const chapterId = context.params.chapterId;
      const newData = snap.after.data();
      const comicRef = db.collection("comics").doc(comicId);
      return db.runTransaction((transaction) => {
        return transaction.get(comicRef)
            .then((comicDoc) => {
              const {chapters_data: chapters} = comicDoc.data();
              const oldChapterData = chapters.find((v) => v.id == chapterId);

              const chapterDataKeys = [
                "chapter_number",
                "chapter_preview_url",
                "price",
                "release_date",
                "view_count",
              ];
              const newChapterData = {};
              chapterDataKeys.forEach((key) => {
                newChapterData[key] = newData[key];
              });
              newChapterData.id = context.params.chapterId;

              transaction.update(comicRef, {
                chapters_data: admin.firestore.FieldValue.arrayRemove(oldChapterData),
              });
              transaction.update(comicRef, {
                chapters_data: admin.firestore.FieldValue.arrayUnion(newChapterData),
                last_update: new Date(),
              });
            });
      });

      // db.collection("comics").doc(comicId).get().then((comicSnap) => {
      //   comicSnap.docs[0].data()
      // });
      // return db.collection("comics")
      //     .doc(comicId)
      //     .update({
      //       last_update: new Date(),
      //     });
    });

exports.onCreateChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapters/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onCreate((snap, context) => {
      const comicId = context.params.comicId;
      const chapterId = context.params.chapterId;
      const newData = snap.data();

      const batch = db.batch();
      for (let k = 0; k < 10; k++) {
        const ref = db.collection("comics")
            .doc(comicId)
            .collection("chapters")
            .doc(chapterId)
            .collection("counters")
            .doc(k.toString());
        batch.set(ref, {
          view_count: 0,
        });
      }
      const chapterCounterAll = batch.commit();

      const comicRef = db.collection("comics").doc(comicId);
      const usersRef = db.collection("users").where("comic_subscriptions", "array-contains", comicRef);
      const setFeed = db.runTransaction((transaction) => {
        return transaction.get(usersRef)
            .then((userSnap) => {
              if (!userSnap.empty) {
                const userDocs = Object.values(userSnap.docs);
                for (let i = 0; i < userDocs.length; i++) {
                  const notificationRef = db.collection("notifications").doc(userDocs[i].id);
                  transaction.set(notificationRef, {
                    unread_count: admin.firestore.FieldValue.increment(1),
                  }, {merge: true});
                  const feedRef = notificationRef.collection("comics").doc();
                  transaction.set(feedRef, {
                    created_date: new Date(),
                    comic: db.collection("comics").doc(comicId),
                    chapter: db.collection("comics").doc(comicId).collection("chapters").doc(chapterId),
                    unread: true,
                  });
                }
              }
            });
      });

      const chapterDataKeys = [
        "chapter_number",
        "chapter_preview_url",
        "price",
        "release_date",
        "view_count",
      ];
      const newChapterData = {};
      chapterDataKeys.forEach((key) => {
        newChapterData[key] = newData[key];
      });
      newChapterData.id = context.params.chapterId;

      const updateComic = comicRef.update({
        chapters_data: admin.firestore.FieldValue.arrayUnion(newChapterData),
        last_update: new Date(),
      });

      // const updateComic = db.runTransaction((transaction) => {
      //   return transaction.get(comicRef)
      //   // eslint-disable-next-line no-unused-vars
      //       .then((comicDoc) => {
      //         const chapterDataKeys = [
      //           "chapter_number",
      //           "chapter_preview_url",
      //           "price",
      //           "release_date",
      //           "view_count",
      //         ];
      //         const newChapterData = {};
      //         chapterDataKeys.forEach((key) => {
      //           newChapterData[key] = newData[key];
      //         });
      //         newChapterData.id = context.params.chapterId;

      //         transaction.update(comicRef, {
      //           chapters_data: admin.firestore.FieldValue.arrayUnion(newChapterData),
      //           last_update: new Date(),
      //         });
      //       });
      // });
      return Promise.all([setFeed, updateComic, chapterCounterAll]);
      // return db.collection("comics")
      //     .doc(comicId)
      //     .update({
      //       last_update: new Date(),
      //     });
    });

exports.onDeleteChapter = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}/chapters/{chapterId}")
    // eslint-disable-next-line no-unused-vars
    .onDelete((snap, context) => {
      const comicId = context.params.comicId;
      const chapterId = context.params.chapterId;
      const comicRef = db.collection("comics").doc(comicId);
      const comicUpdates = db.runTransaction((transaction) => {
        return transaction.get(comicRef)
            .then((comicDoc) => {
              const {chapters_data: chapters} = comicDoc.data();
              const oldChapterData = chapters.find((v) => v.id == chapterId);
              transaction.update(comicRef, {
                chapters_data: admin.firestore.FieldValue.arrayRemove(oldChapterData),
              });
            });
      });

      const deleteCounters = db.collection("comics")
          .doc(comicId)
          .collection("chapters")
          .doc(chapterId)
          .collection("counters")
          .get()
          .then((snapshot) => {
            if (snapshot.empty) {
              return Promise.resolve(true);
            }
            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
            });
            return batch.commit();
          })

      return Promise.all([comicUpdates, deleteCounters])

      // return db.collection("comics")
      //     .doc(comicId)
      //     .update({
      //       last_update: new Date(),
      //     });
    });

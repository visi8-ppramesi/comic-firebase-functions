const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.viewCountUpdater = functions
    .region("asia-east2")
    .pubsub
    .schedule("every 6 hours")
    // eslint-disable-next-line no-unused-vars
    .onRun((context) => {
      const updateCounter = (counterObj) => {
        if (counterObj.view_count == counterObj.current_count) {
          return Promise.resolve(true);
        } else {
          return counterObj.ref.update({
            view_count: counterObj.view_count,
          });
        }
      };

      const comicsPromise = () => {
        return new Promise((resolve, reject) => {
          const stuff = [];
          const stream = db.collection("comics").stream();
          stream.on("data", (documentSnapshot) => {
            stuff.push(
                db.collection("comics").doc(documentSnapshot.id).collection("counters").get().then((counterSnapshot) => {
                  let count = 0;
                  counterSnapshot.forEach((counterDocument) => {
                    count += counterDocument.get("view_count");
                  });

                  return {ref: documentSnapshot.ref, view_count: count, current_count: documentSnapshot.get("view_count")};
                }).then(updateCounter),
            );
          });
          stream.once("end", () => {
            Promise.all(stuff).then(resolve);
          });
          stream.once("error", (err) => {
            reject(err);
          });
        });
      };

      const chaptersPromise = () => {
        return new Promise((resolve, reject) => {
          const stuff = [];
          const stream = db.collectionGroup("chapters").stream();
          stream.on("data", (documentSnapshot) => {
            stuff.push(
                db.collection("comics").doc(documentSnapshot.ref.parent.parent.id).collection("chapters").doc(documentSnapshot.id).collection("counters").get().then((counterSnapshot) => {
                  let count = 0;
                  counterSnapshot.forEach((counterDocument) => {
                    count += counterDocument.get("view_count");
                  });

                  return {ref: documentSnapshot.ref, view_count: count, current_count: documentSnapshot.get("view_count")};
                }).then(updateCounter),
            );
          });
          stream.once("end", () => {
            Promise.all(stuff).then(resolve);
          });
          stream.once("error", (err) => {
            reject(err);
          });
        });
      };

      return Promise.all([comicsPromise(), chaptersPromise()]);

      // return db.collectionGroup("counters").get().then((querySnapshot) => {
      //   const comicAggregated = {};
      //   const chapterAggregated = {};
      //   querySnapshot.forEach((doc) => {
      //     const path = doc.ref.path.split("/");
      //     const comicId = path[1];
      //     if (path[2] == "chapters") {
      //       const chapterId = path[3];
      //       if (chapterAggregated[comicId]) {
      //         if (chapterAggregated[comicId][chapterId]) {
      //           chapterAggregated[comicId][chapterId] += doc.get("view_count");
      //         } else {
      //           chapterAggregated[comicId][chapterId] = doc.get("view_count");
      //         }
      //       } else {
      //         chapterAggregated[comicId] = {
      //           [chapterId]: doc.get("view_count"),
      //         };
      //       }
      //     } else if (path.length == 4) {
      //       if (comicAggregated[comicId]) {
      //         comicAggregated[comicId] += doc.get("view_count");
      //       } else {
      //         comicAggregated[comicId] = doc.get("view_count");
      //       }
      //     }
      //   });

      //   const comicIds = Object.keys(comicAggregated);
      //   const promises = [];
      //   if (comicIds.length > 0) {
      //     comicIds.forEach((comicId) => {
      //       promises.push(
      //           db.collection("comics").doc(comicId).update({
      //             view_count: comicAggregated[comicId],
      //           }),
      //       );
      //       if (chapterAggregated[comicId] &&
      //         typeof chapterAggregated[comicId] == "object") {
      //         const comicCptIds = Object.keys(chapterAggregated[comicId]);
      //         if (comicCptIds.length > 0) {
      //           comicCptIds.forEach((cptId) => {
      //             promises.push(
      //                 db.collection("comics")
      //                     .doc(comicId)
      //                     .collection("chapters")
      //                     .doc(cptId)
      //                     .update({
      //                       view_count: chapterAggregated[comicId][cptId],
      //                     }),
      //             );
      //           });
      //         }
      //       }
      //     });
      //   }
      //   return Promise.all(promises);
      // });
    });

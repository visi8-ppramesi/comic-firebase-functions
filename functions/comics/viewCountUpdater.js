const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.viewCountUpdater = functions
    .region("asia-east2")
    .pubsub
    .schedule("every 6 hours")
    // eslint-disable-next-line no-unused-vars
    .onRun((context) => {
      return db.collectionGroup("counters").get().then((querySnapshot) => {
        const comicAggregated = {};
        const chapterAggregated = {};
        querySnapshot.forEach((doc) => {
          const path = doc.ref.path.split("/");
          const comicId = path[1];
          if (path[2] == "chapters") {
            const chapterId = path[3];
            if (chapterAggregated[comicId]) {
              if (chapterAggregated[comicId][chapterId]) {
                chapterAggregated[comicId][chapterId] += doc.get("view_count");
              } else {
                chapterAggregated[comicId][chapterId] = doc.get("view_count");
              }
            } else {
              chapterAggregated[comicId] = {
                [chapterId]: doc.get("view_count"),
              };
            }
          } else if (path.length == 4) {
            if (comicAggregated[comicId]) {
              comicAggregated[comicId] += doc.get("view_count");
            } else {
              comicAggregated[comicId] = doc.get("view_count");
            }
          }
        });

        const comicIds = Object.keys(comicAggregated);
        const promises = [];
        if (comicIds.length > 0) {
          comicIds.forEach((comicId) => {
            promises.push(
                db.collection("comics").doc(comicId).update({
                  view_count: comicAggregated[comicId],
                })
            );
            if (chapterAggregated[comicId] &&
              typeof chapterAggregated[comicId] == "object") {
              const comicCptIds = Object.keys(chapterAggregated[comicId]);
              if (comicCptIds.length > 0) {
                comicCptIds.forEach((cptId) => {
                  promises.push(
                      db.collection("comics")
                          .doc(comicId)
                          .collection("chapters")
                          .doc(cptId)
                          .update({
                            view_count: chapterAggregated[comicId][cptId],
                          }),
                  );
                });
              }
            }
          });
        }
        return Promise.all(promises);
      });
    });

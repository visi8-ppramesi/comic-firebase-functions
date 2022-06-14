const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createChapterGopayCharge = functions
    .region("asia-east2")
    .https
    .onCall((data, context) => {
      const createChapterOrder = (orderId) => {
        const {grossAmount} = data.transactionDetails;
        const {chapterId, comicId, chapterNum, comicName} = data.chapterDetails;
        return db.collection("users").doc(data.uid).collection("orders").add({
          status: "open",
          order_id: orderId,
          total_amount: grossAmount,
          created_date: new Date(),
          items: [{
            name: comicName + ":" + chapterNum,
            description: comicName + ", chapter " + chapterNum,
            reference: db.collection("comics").doc(comicId).collection("chapters").doc(chapterId),
          }],
        });
      };

      if (!context.auth) {
        throw new functions
            .https
            .HttpsError("unauthenticated", "You must be authenticated");
      }
      const {fetchGopayCharge} = require("../utils/gopay.js");
      const {v4} = require("uuid");
      const orderId = v4();
      return createChapterOrder(data, orderId).then(() => {
        return fetchGopayCharge(data, orderId);
      });
    });

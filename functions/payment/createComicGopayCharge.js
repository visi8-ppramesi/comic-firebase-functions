const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createComicGopayCharge = functions
    .region("asia-east2")
    .https
    .onCall((data, context) => {
      const createComicOrder = (orderId) => {
        const {grossAmount, userId} = data.transactionDetails;
        const {comicId, comicName} = data.chapterDetails;
        return db.collection("users").doc(userId).collection("orders").add({
          status: "open",
          order_id: orderId,
          total_amount: grossAmount,
          created_date: new Date(),
          items: [{
            name: comicName,
            description: comicName,
            reference: db.collection("comics").doc(comicId),
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
      return createComicOrder(orderId).then(() => {
        return fetchGopayCharge(data, orderId);
      });
    });

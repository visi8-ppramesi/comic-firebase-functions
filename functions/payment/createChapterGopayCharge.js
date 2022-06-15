const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createChapterGopayCharge = functions
    .region("asia-east2")
    .https
    .onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions
            .https
            .HttpsError("unauthenticated", "You must be authenticated");
      }

      const {checkChaptersPrice, createChapterOrder} = require("./utils/paymentUtils.js");
      const checkPrice = await checkChaptersPrice(db, data);
      if (!checkPrice) {
        throw new functions
            .https
            .HttpsError("invalid-argument", "Price error");
      }

      const {fetchGopayCharge} = require("./utils/gopayUtils.js");
      const {v4} = require("uuid");
      const orderId = v4();

      return fetchGopayCharge(data, orderId).then((chargeResponse) => {
        return createChapterOrder(db, data, orderId, chargeResponse);
      }).catch((err) => {
        throw new functions
            .https
            .HttpsError("internal", "Either charge or create order document error", err);
      });
      // return createChapterOrder(db, data, orderId).then(() => {
      //   return fetchGopayCharge(data, orderId);
      // });
    });

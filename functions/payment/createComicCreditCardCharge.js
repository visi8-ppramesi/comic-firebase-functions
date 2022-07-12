const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createComicCreditCardCharge = functions
    .region("asia-east2")
    .https
    .onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions
            .https
            .HttpsError("unauthenticated", "You must be authenticated");
      }

      const {checkComicsPrice, createComicOrder} = require("./utils/paymentUtils.js");
      const checkPrice = await checkComicsPrice(db, data);
      if (!checkPrice) {
        throw new functions
            .https
            .HttpsError("invalid-argument", "Price error");
      }

      const {fetchCreditCardCharge} = require("./utils/creditCardUtils.js");
      const {v4} = require("uuid");
      const orderId = v4();

      return fetchCreditCardCharge(data, orderId, data.creditCardDetails.tokenId).then((chargeResponse) => {
        return createComicOrder(db, data, orderId, chargeResponse)
            .then((docRef) => {
              return {docRef, chargeResponse};
            });
      }).catch((err) => {
        throw new functions
            .https
            .HttpsError("internal", "Either charge or create order document error", err);
      });
      // return createChapterOrder(db, data, orderId).then(() => {
      //   return fetchGopayCharge(data, orderId);
      // });
    });

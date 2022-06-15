const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createComicGopayCharge = functions
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
        return "price check failed";
      }

      const {fetchGopayCharge} = require("./utils/gopayUtils.js");
      const {v4} = require("uuid");
      const orderId = v4();

      return fetchGopayCharge(data, orderId).then((chargeResponse) => {
        return createComicOrder(db, data, orderId, chargeResponse);
      });
      // return createComicOrder(db, data, orderId).then(() => {
      //   return fetchGopayCharge(data, orderId);
      // });
    });

const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.createChapterGopayCharge = functions
    .region("asia-east2")
    .https
    .onCall(async (data, context) => {
      const {userId} = data.customerDetails;
      const {grossAmount, tax, fee} = data.transactionDetails;
      const itemsDetails = data.itemsDetails;
      let totalItemsPrice = 0;

      const priceCheckPromises = itemsDetails.map((itemDetails) => {
        const {chapterId, comicId, itemPrice} = itemDetails;
        return db
            .collection("comics").doc(comicId)
            .collection("chapters").doc(chapterId)
            .get().then((chapterDoc) => {
              totalItemsPrice += chapterDoc.data().price;
              return itemPrice == chapterDoc.data().price;
            });
      });

      const itemsPriceCheck = await Promise.all(priceCheckPromises).then((checks) => {
        return checks.reduce((acc, v) => acc && v, true);
      });

      const myTaxRate = 0.11; // change later into settings
      const myTax = totalItemsPrice * myTaxRate;
      const myFee = 0; // change later into settings
      const myTotal = totalItemsPrice + myTax + myFee;

      const totalPriceCheck = myTotal == grossAmount;

      if (!(itemsPriceCheck && totalPriceCheck)) {
        return "price check failed";
      }

      const createChapterOrder = (orderId) => {
        const items = itemsDetails.map((itemDetails) => {
          const {chapterId, comicId, chapterNum, comicName, itemPrice} = itemDetails;
          return {
            name: comicName + ":" + chapterNum,
            description: comicName + ", chapter " + chapterNum,
            reference: db.collection("comics").doc(comicId).collection("chapters").doc(chapterId),
            price: itemPrice,
          };
        });
        return db.collection("users").doc(userId).collection("orders").add({
          status: "open",
          order_id: orderId,
          total_amount: grossAmount,
          created_date: new Date(),
          tax, fee,
          items: items,
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
      return createChapterOrder(orderId).then(() => {
        return fetchGopayCharge(data, orderId);
      });
    });

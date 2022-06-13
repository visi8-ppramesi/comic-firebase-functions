const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

const fetchGopayCharge = (data) => {
  const {grossAmount, orderId} = data.transactionDetails;
  const {email, fullName} = data.customerDetails;
  let firstName; let lastName;
  if (fullName.split(" ").length < 2) {
    firstName = fullName;
    lastName = fullName;
  } else {
    const splitName = fullName.split(" ");
    firstName = splitName[0];
    lastName = splitName[splitName.length - 1];
  }

  const midtransClient = require("midtrans-client");
  const core = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  const parameter = {
    "payment_type": "gopay",
    "transaction_details": {
      "gross_amount": grossAmount,
      "order_id": orderId,
    },
    "customer_details": {
      "first_name": firstName,
      "last_name": lastName,
      "email": email,
    },
    "gopay": {
      "enable_callback": true,
      "callback_url": process.env.MIDTRANS_CALLBACK_URL,
    },
  };

  // charge transaction
  return core.charge(parameter)
      .then((chargeResponse) => {
        return chargeResponse;
      });
}

const createComicOrder = (data) => {
  const {grossAmount, orderId} = data.transactionDetails;
  const {comicId, comicName} = data.chapterDetails;
  return db.collection('users').doc(data.uid).collection('orders').add({
    status: 'open',
    order_id: orderId,
    total_amount: grossAmount,
    created_date: new Date(),
    items: [{
      name: comicName,
      description: comicName,
      reference: db.collection('comics').doc(comicId)
    }]
  })
}

exports.createComicGopayCharge = functions
    .region("asia-east2")
    .https
    .onCall((data, context) => {
      if (!context.auth) {
        throw new functions
            .https
            .HttpsError("unauthenticated", "You must be authenticated");
      }
      return createComicOrder(data).then(() => {
        return fetchGopayCharge(data, context)
      })
    });

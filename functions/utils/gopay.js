exports.fetchGopayCharge = (data, orderId) => {
  const {grossAmount, tax, fee} = data.transactionDetails;
  const {email, fullName} = data.customerDetails;
  const itemsDetails = data.itemsDetails;
  const items = itemsDetails.map((itemDetails) => {
    const {chapterNum, comicName, itemPrice} = itemDetails;
    return {
      name: comicName + ":" + chapterNum,
      description: comicName + ", chapter " + chapterNum,
      price: itemPrice,
    };
  });
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
      "tax": tax,
      "fee": fee,
      "items": items,
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
};

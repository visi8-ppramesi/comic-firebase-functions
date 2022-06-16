const {buildParameter} = require("./paymentUtils.js");

exports.fetchCreditCardCharge = (data, orderId, ccToken) => {
  let {currency} = data.transactionDetails;
  const {grossAmount, tax, fee} = data.transactionDetails;
  if (!currency) {// assume IDR
    currency = "IDR";
  }
  const {email, fullName} = data.customerDetails;
  const itemsDetails = data.itemsDetails;
  const items = itemsDetails.map((itemDetails) => {
    const {chapterId, comicId, chapterNum, comicName, itemPrice} = itemDetails;
    if (chapterId) {
      return {
        id: chapterId,
        type: "chapter",
        name: comicName + ":" + chapterNum,
        description: comicName + ", chapter " + chapterNum,
        price: itemPrice,
      };
    } else {
      return {
        id: comicId,
        type: "comic",
        name: comicName,
        description: comicName,
        price: itemPrice,
      };
    }
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
    isProduction: process.env.MIDTRANS_MODE == "prod",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  const transactionDetails = {
    "gross_amount": grossAmount,
    "order_id": orderId,
    "currency": currency,
    "tax": tax,
    "fee": fee,
  };

  const customerDetails = {
    "first_name": firstName,
    "last_name": lastName,
    "email": email,
  };

  const extraParams = {
    "credit_card": {
      "token_id": ccToken,
      "authentication": true,
    },
  };

  const parameter = buildParameter(
      "gopay",
      items,
      transactionDetails,
      customerDetails,
      extraParams,
  );

  // charge transaction
  return core.charge(parameter)
      .then((chargeResponse) => {
        return chargeResponse;
      });
};

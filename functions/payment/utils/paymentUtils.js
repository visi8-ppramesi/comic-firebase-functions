exports.createComicOrder = function(db, data, orderId, chargeResponse, status = 'open') {
  const {userId} = data.customerDetails;
  const {grossAmount, tax, fee} = data.transactionDetails;
  const itemsDetails = data.itemsDetails;
  const items = itemsDetails.map((itemDetail) => {
    const {comicId, comicName, itemPrice} = itemDetail;
    return {
      name: comicName,
      description: comicName,
      type: "comic",
      reference: db.collection("comics").doc(comicId),
      price: itemPrice,
    };
  });
  return db.collection("users").doc(userId).collection("orders").add({
    status: status,
    order_id: orderId,
    total_amount: grossAmount,
    created_date: new Date(),
    tax, fee,
    items: items,
    charge_response: chargeResponse,
  });
};

exports.createChapterOrder = function(db, data, orderId, chargeResponse, status = 'open') {
  const {userId} = data.customerDetails;
  const {grossAmount, tax, fee} = data.transactionDetails;
  const itemsDetails = data.itemsDetails;
  const items = itemsDetails.map((itemDetail) => {
    const {chapterId, comicId, chapterNum, comicName, itemPrice} = itemDetail;
    return {
      name: comicName + ":" + chapterNum,
      description: comicName + ", chapter " + chapterNum,
      type: "chapter",
      reference: db.collection("comics").doc(comicId).collection("chapters").doc(chapterId),
      price: itemPrice,
    };
  });
  return db.collection("users").doc(userId).collection("orders").add({
    status: status,
    order_id: orderId,
    total_amount: grossAmount,
    created_date: new Date(),
    tax, fee,
    items: items,
    charge_response: chargeResponse,
  });
};

exports.checkComicsPrice = async function(db, data) {
  const {grossAmount} = data.transactionDetails;
  const itemsDetails = data.itemsDetails;
  let totalItemsPrice = 0;

  const priceCheckPromises = itemsDetails.map((itemDetails) => {
    const {comicId, itemPrice} = itemDetails;
    return db
        .collection("comics").doc(comicId)
        .get().then((comicDoc) => {
          totalItemsPrice += comicDoc.data().price;
          return itemPrice == comicDoc.data().price;
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

  return itemsPriceCheck && totalPriceCheck;
};

exports.checkChaptersPrice = async function(db, data) {
  const {grossAmount} = data.transactionDetails;
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

  return itemsPriceCheck && totalPriceCheck;
};

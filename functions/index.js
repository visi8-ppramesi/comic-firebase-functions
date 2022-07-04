exports.onCreateUser = require("./auth/onCreateUser.js");
exports.onDeleteUser = require("./auth/onDeleteUser.js");
exports.viewCountUpdater = require("./comics/viewCountUpdater.js");
// const {
//   testHttpsCall,
// } = require("./test/testCall.js");
// exports.testHttpsCall = testHttpsCall;
exports.createChapterGopayCharge = require("./payment/createChapterGopayCharge.js");
exports.createComicGopayCharge = require("./payment/createComicGopayCharge.js");

exports.createChapterCreditCardCharge = require("./payment/createChapterCreditCardCharge.js");
exports.createComicCreditCardCharge = require("./payment/createComicCreditCardCharge.js");

const {
  onUpdateChapter,
  onCreateChapter,
  onDeleteChapter,
} = require("./comics/onChangeChapter.js");
exports.onUpdateChapter = onUpdateChapter;
exports.onCreateChapter = onCreateChapter;
exports.onDeleteChapter = onDeleteChapter;

const {
  onCreateComic,
} = require("./comics/onChangeComic.js");
exports.onCreateComic = onCreateComic;

const {
  onUpdateUser,
} = require("./user/onChangeUser.js");
exports.onUpdateUser = onUpdateUser;

const {
  onUpdateAuthor,
} = require("./author/onChangeAuthor.js");
exports.onUpdateAuthor = onUpdateAuthor;

exports.paymentWebhook = require("./payment/paymentWebhook.js");

exports.moveTemporaryFile = require("./filesystem/moveTemporaryFile.js");

// const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

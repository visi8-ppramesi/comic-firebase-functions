exports.onCreateUser = require("./auth/onCreateUser.js");
exports.onDeleteUser = require("./auth/onDeleteUser.js");
exports.viewCountUpdater = require("./comics/viewCountUpdater.js");
exports.testCall = require("./test/testCall.js");
exports.createGopayCharge = require("./payment/createGopayCharge.js");

const {
  onUpdateChapter,
  onCreateChapter,
  onDeleteChapter,
} = require("./comics/onChangeChapter.js");
exports.onUpdateChapter = onUpdateChapter;
exports.onCreateChapter = onCreateChapter;
exports.onDeleteChapter = onDeleteChapter;

const {
  onUpdateUser,
} = require("./user/onChangeUser.js");
exports.onUpdateUser = onUpdateUser;

const {
  onUpdateAuthor,
} = require("./author/onChangeAuthor.js");
exports.onUpdateAuthor = onUpdateAuthor;

// const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

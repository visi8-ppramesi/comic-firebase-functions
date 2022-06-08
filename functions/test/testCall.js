const functions = require("firebase-functions");

exports.testCall = functions
    .region("asia-east2")
    .https
    // eslint-disable-next-line no-unused-vars
    .onCall((data, context) => {
      const axios = require("axios");
      return axios.post("https://ptsv2.com/t/visi8-test/post").then((resp) => {
        return resp.data;
      });
    //   return new Promise((resolve, reject) => {
    //     axios.post("https://visi8-firebase-test.ap.ngrok.io", {where: "from firebase functions"})
    //         .then((res) => {
    //           resolve(res);
    //         }).catch((err) => {
    //           reject(err);
    //         });
    //   });
    });

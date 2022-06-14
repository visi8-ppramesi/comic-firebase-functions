const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const matchSignature = require("../middlewares/matchSignature.js");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

const app = express();
app.use(cors({origin: true}));
app.use(matchSignature);
app.use(express.json());
app.post("/", async (req, res) => {
  const {body} = req;
  try {
    await db.collectionGroup("orders")
        .where("order_id", "==", body.order_id)
        .get()
        .then((orderSnap) => {
          if (
            body.transaction_status == "settlement" ||
          body.transaction_status == "capture" ||
          body.transaction_status == "authorize"
          ) {
            const {getObjectPath} = require("../utils/pathUtils.js");
            const orderData = orderSnap.docs[0].data();
            const refs = orderData.items.reduce((acc, item) => {
              const itemPath = getObjectPath(item.reference.path.split("/"));
              if (acc[itemPath["comics"]]) {
                if (itemPath["chapters"]) {
                  acc[itemPath["comics"]].push(item.reference);
                } else {
                  acc[itemPath["comics"]].push("all");
                }
              } else {
                if (itemPath["chapters"]) {
                  acc[itemPath["comics"]] = [item.reference];
                } else {
                  acc[itemPath["comics"]] = ["all"];
                }
              }
              return acc;
            }, {});
            const orderPath = getObjectPath(orderSnap.docs[0].ref.path.split("/"));
            const batchProc = db.batch();
            batchProc.update(orderSnap.docs[0].ref, {
              status: "closed",
              charge_data: body,
            });
            Object.keys(refs).forEach((comicKey) => {
              batchProc.set(
                  db.collection("users").doc(orderPath["users"])
                      .collection("purchased_comics").doc(comicKey),
                  {
                    chapters: admin.firestore.FieldValue.arrayUnion(...refs[comicKey]),
                  },
                  {merge: true},
              );
            });
            return batchProc.commit();
          // return orderSnap.docs[0].ref.update({
          //   status: 'closed',
          //   charge_data: body
          // }).then(() => {
          //   const promises = Object.keys(refs).forEach((comicKey) => {
          //     return db.collection('users').doc(orderPath['users'])
          //       .collection('purchased_comics').doc(comicKey).set({
          //         chapters: admin.firestore.FieldValue.arrayUnion(...refs[comicKey])
          //       }, {merge: true})
          //   })
          //   return Promise.all(promises)
          // })
          } else if (
            body.transaction_status == "deny" ||
          body.transaction_status == "cancel" ||
          body.transaction_status == "expire" ||
          body.transaction_status == "failure"
          ) {
            return orderSnap.docs[0].ref.update({
              status: body.transaction_status,
              charge_data: body,
            });
          }
        });
    res.status(200).send({status: "ok"});
  } catch (error) {
    res.status(500).send({status: "error", error});
  }
});

exports.paymentWebhook = functions
    .region("asia-east2")
    .https
    .onRequest(app);

const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onUpdateUser = functions
    .region("asia-east2")
    .firestore
    .document("/users/{userId}")
    // eslint-disable-next-line no-unused-vars
    .onUpdate((change, context) => {
      const data = change.after.data();
      const fields = Object.keys(data);
      if (!(fields.includes("name") || fields.includes("profile_image_url"))) {
        return false;
      }
      const userRef = db.doc("users", context.params.userId);
      const newData = ["id", "name", "profile_image_url"].reduce((acc, v) => {
        if (v == "id") {
          acc[v] = userRef;
        } else {
          acc[v] = data[v];
        }

        return acc;
      }, {});

      const commCollGroup = db.collectionGroup("comments");
      const query = commCollGroup.where("user", "==", userRef);
      return query.get().then((snap) => {
        const commDocs = Object.values(snap.docs);
        const promises = [];
        for (let i = 0; i < commDocs.length; i++) {
          promises.push(commDocs[i].ref.update({
            user_data: newData,
          }));
        }
        return Promise.all(promises);
      });
    });

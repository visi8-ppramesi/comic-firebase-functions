const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onUpdateAuthor = functions
    .region("asia-east2")
    .firestore
    .document("/authors/{authorId}")
    // eslint-disable-next-line no-unused-vars
    .onUpdate((change, context) => {
      const data = change.after.data();
      const beforeData = change.before.data();
      const fields = Object.keys(data);
      if (!(fields.includes("name") || fields.includes("profile_picture_url"))) {
        return false;
      }
      const authorRef = db.collection("authors").doc(context.params.authorId);
      const newData = ["id", "name", "profile_picture_url"].reduce((acc, v) => {
        if (v == "id") {
          acc[v] = authorRef;
        } else {
          acc[v] = data[v];
        }

        return acc;
      }, {});
      const oldData = ["id", "name", "profile_picture_url"].reduce((acc, v) => {
        if (v == "id") {
          acc[v] = authorRef;
        } else {
          acc[v] = beforeData[v];
        }

        return acc;
      }, {});

      const comColl = db.collection("comics");
      const query = comColl.where("authors", "array-contains", authorRef);
      return query.get().then((snap) => {
        const commDocs = Object.values(snap.docs);

        const promises = [];
        for (let i = 0; i < commDocs.length; i++) {
          const newPromise = commDocs[i].ref.update({
            authors_data: admin.firestore.FieldValue.arrayRemove(oldData),
          }).then(() => {
            return commDocs[i].ref.update({
              authors_data: admin.firestore.FieldValue.arrayUnion(newData),
            });
          });
          promises.push(newPromise);
        }
        return Promise.all(promises);
      });
    });

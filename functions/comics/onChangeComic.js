const functions = require("firebase-functions");
const {admin} = require("../initializeAdmin.js");

const db = admin.firestore();

exports.onUpdateComic = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}")
    // eslint-disable-next-line no-unused-vars
    .onUpdate((snap, context) => {
      const _ = require("lodash");
      const isEqualUnordered = (a, b) => {
        return _.isEqual(_.sortBy(a), _.sortBy(b));
      };
      const comicId = context.params.comicId;
      const {authors_data: newAuthorsData, tags: newTags, categories: newCategories, title: newTitle} = snap.after.data();
      const {authors_data: oldAuthorsData, tags: oldTags, categories: oldCategories, title: oldTitle} = snap.before.data();

      const newKeywords = [];
      const oldKeywords = [];
      if (!_.isNil(newAuthorsData)) {
        const newAuthorsName = newAuthorsData.map((author) => author.name);
        if (!_.isNil(oldAuthorsData)) {
          const oldAuthorsName = oldAuthorsData.map((author) => author.name);
          if (!isEqualUnordered(newAuthorsName, oldAuthorsName)) {
            newKeywords.push(...new Set(_.flatten(newAuthorsName.map((author) => author.split(" ")))));
            oldKeywords.push(...new Set(_.flatten(oldAuthorsName.map((author) => author.split(" ")))));
          }
        } else {
          newKeywords.push(...new Set(_.flatten(newAuthorsName.map((author) => author.split(" ")))));
        }
      }

      if (!_.isNil(newTags) && !isEqualUnordered(newTags, oldTags)) {
        newKeywords.push(...new Set(newTags));
        oldKeywords.push(...new Set(oldTags));
      }

      if (!_.isNil(newCategories) && !isEqualUnordered(newCategories, oldCategories)) {
        newKeywords.push(...new Set(newCategories));
        oldKeywords.push(...new Set(oldCategories));
      }

      if (!_.isNil(newTitle) && newTitle != oldTitle) {
        newKeywords.push(...new Set(newTitle.split(" ")));
        oldKeywords.push(...new Set(oldTitle.split(" ")));
      }

      if (newKeywords.length > 0) {
        functions.logger.log("updating comic keywords");
        const batch = db.batch();
        const comicRef = db.collection("comics").doc(comicId);

        batch.update(comicRef, {
          keywords: admin.firestore.FieldValue.arrayRemove(...oldKeywords),
        });

        batch.update(comicRef, {
          keywords: admin.firestore.FieldValue.arrayUnion(...newKeywords),
        });

        return batch.commit();
      } else {
        return false;
      }
    });

exports.onCreateComic = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}")
    // eslint-disable-next-line no-unused-vars
    .onCreate((snap, context) => {
      // add keywords to document
      const _ = require("lodash");
      const comicId = context.params.comicId;
      const {authors_data: newAuthorsData, tags: newTags, categories: newCategories, title: newTitle} = snap.data();
      const newKeywords = [];
      if (!_.isNil(newAuthorsData)) {
        const newAuthorsName = newAuthorsData.map((author) => author.name);
        newKeywords.push(...new Set(_.flatten(newAuthorsName.map((author) => author.split(" ")))));
      }
      if (!_.isNil(newTags)) {
        newKeywords.push(...new Set(newTags));
      }
      if (!_.isNil(newCategories)) {
        newKeywords.push(...new Set(newCategories));
      }
      if (!_.isNil(newTitle)) {
        newKeywords.push(...new Set(newTitle.split(" ")));
      }

      let keywordChange;

      if (newKeywords.length > 0) {
        functions.logger.log("updating comic keywords after creation");
        keywordChange = db.collection("comics").doc(comicId).update({
          keywords: admin.firestore.FieldValue.arrayUnion(...newKeywords),
        });
      } else {
        keywordChange = Promise.resolve(true);
      }

      // increment item counter in settings collection
      const counterRef = db.collection("settings").doc("comic_counter");
      const counterPromise = counterRef.update({value: admin.firestore.FieldValue.increment(1)});

      const batch = db.batch();
      for (let k = 0; k < 10; k++) {
        const ref = db.collection("comics")
            .doc(context.params.comicId)
            .collection("counters")
            .doc(k.toString());
        batch.set(ref, {
          view_count: 0,
        });
      }
      return Promise.all([batch.commit(), counterPromise, keywordChange]);
    });

exports.onDeleteComic = functions
    .region("asia-east2")
    .firestore
    .document("/comics/{comicId}")
    // eslint-disable-next-line no-unused-vars
    .onDelete((snap, context) => {
      const counterRef = db.collection("settings").doc("comic_counter");
      return counterRef.update({value: admin.firestore.FieldValue.increment(-1)});
    });

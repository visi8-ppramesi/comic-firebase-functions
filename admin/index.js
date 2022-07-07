const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const admin = require('firebase-admin')

const serviceAccount = require("./creds/comics-77200-firebase-adminsdk-fw3k7-4044a28c65.json")

const app = initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore(app)

let counter = 0

class BatchHandler{
    constructor(db){
        this.batches = []
        this.counter = 0
        this.db = db
    }

    addUpdate(ref, data){
        if(this.counter % 500 == 0){
            this.batches.push(this.db.batch())
        }
        this.batches[this.batches.length - 1].update(ref, data)
        this.counter++
    }

    commitAll(){
        return Promise.all(this.batches.map(batch => batch.commit()))
    }
}

(async () => {
    const updateCounter = (counterObj) => {
      if(counterObj.view_count == counterObj.current_count){
        return Promise.resolve(true)
      }else{
        return counterObj.ref.update({
          view_count: counterObj.view_count,
        });
      }
    };

    const comicsPromise = () => {
      return new Promise((resolve, reject) => {
        const stuff = [];
        const stream = db.collection("comics").stream();
        stream.on("data", (documentSnapshot) => {
          stuff.push(
              db.collection("comics").doc(documentSnapshot.id).collection("counters").get().then((counterSnapshot) => {
                let count = 0;
                counterSnapshot.forEach((counterDocument) => {
                  count += counterDocument.get("view_count");
                });

                return {ref: documentSnapshot.ref, view_count: count, current_count: documentSnapshot.get("view_count")};
              }).then(updateCounter),
          );
        });
        stream.once("end", () => {
          Promise.all(stuff).then(resolve);
        });
        stream.once("error", (err) => {
          reject(err);
        });
      });
    };

    const chaptersPromise = () => {
      return new Promise((resolve, reject) => {
        const stuff = [];
        const stream = db.collectionGroup("chapters").stream();
        stream.on("data", (documentSnapshot) => {
          stuff.push(
              db.collection("comics").doc(documentSnapshot.ref.parent.parent.id).collection("chapters").doc(documentSnapshot.id).collection("counters").get().then((counterSnapshot) => {
                let count = 0;
                counterSnapshot.forEach((counterDocument) => {
                  count += counterDocument.get("view_count");
                });

                return {ref: documentSnapshot.ref, view_count: count, current_count: documentSnapshot.get("view_count")};
              }).then(updateCounter),
          );
        });
        stream.once("end", () => {
          Promise.all(stuff).then(resolve);
        });
        stream.once("error", (err) => {
          reject(err);
        });
      });
    };

    const test = await Promise.all([comicsPromise(), chaptersPromise()]);
    console.log(test)
})();

/* 
    stream:
    {
        rss: 95805440,
        heapTotal: 55816192,
        heapUsed: 34780944,
        external: 2271240,
        arrayBuffers: 579809
    }

    get:
    {
        rss: 88567808,
        heapTotal: 53719040,
        heapUsed: 22819264,
        external: 1780980,
        arrayBuffers: 114629
    }
*/
// db.collectionGroup("orders").stream().on('data', (documentSnapshot) => {
//     console.log(`Found document with name '${documentSnapshot.id}'`);
//     ++count;
// }).on('end', () => {
//     console.log(`Total count is ${count}`);
// });

// const storage = getStorage(app)
// const bucket = storage.bucket('gs://comics-77200.appspot.com/');

// (async () => {
//     await bucket.getFiles({prefix: 'test_files/'}).then(files => {
//         console.log(files)
//     })
//     await bucket.upload('./test_files/google.png', {destination: 'test_files/google.png'})
//     await bucket.getFiles({prefix: 'test_files/'}).then(files => {
//         console.log(files)
//     })
// })();
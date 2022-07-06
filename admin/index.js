const { initializeApp } = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')
const admin = require('firebase-admin')

const serviceAccount = require("./creds/comics-77200-firebase-adminsdk-fw3k7-4044a28c65.json")

const app = initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const store = admin.firestore()
store.collection("comics")
    .doc('0QVuEovsuxwl3GRurwKz')
    .collection("chapters")
    .doc('xd4LF6iwcsULmlrN4dVN')
    .collection("counters")
    .get()
    .then((snap) => {
        console.log(snap.docs.map(v => v.ref))
    })

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
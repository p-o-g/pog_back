const admin = require('firebase-admin');
const serviceAccount = require('./p-o-g-cf552-firebase-adminsdk-lmexc-c3690468c6');
const dotenv = require('dotenv');

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

module.exports = {
  api: require('./api'),
};

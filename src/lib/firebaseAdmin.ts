import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';

var admin = require("firebase-admin")
var serviceAccount = require("../../iedc-mbcet-firebase-adminsdk-9j5f4-018406d623.json")

//Thanks to this guy
//https://github.com/firebase/firebase-admin-node/issues/2111#issuecomment-1636441596

const usedApps = getApps();
const adminAppConfig ={
  credential: admin.credential.cert(serviceAccount)
}

const adminApp = usedApps.length === 0
? initializeApp(adminAppConfig,"admin-app")
: usedApps[0]


export default adminApp

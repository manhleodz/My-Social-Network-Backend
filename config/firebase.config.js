require('dotenv').config();
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
    apiKey: process.env.VITE_API_KEY1,
    authDomain: process.env.VITE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_URL,
    projectId: process.env.VITE_PROJECT_ID,
    storageBucket: process.env.VITE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_APPID,
    measurementId: process.env.VITE_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

module.exports = {
    auth
}
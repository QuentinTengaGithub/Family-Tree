import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  /*apiKey: process.env.VUE_APP_FB_API_KEY,
  authDomain: process.env.VUE_APP_FB_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FB_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FB_APP_ID,
  measurementId: process.env.VUE_APP_FB_MEASUREMENT_ID,*/

  apiKey: "AIzaSyD8RtOybiV4qaciN18BXopXZLvFPI7K3gI",
  authDomain: "arbre-genealogique-b43f6.firebaseapp.com",
  projectId: "arbre-genealogique-b43f6",
  storageBucket: "arbre-genealogique-b43f6.appspot.com",
  messagingSenderId: "1030508786015",
  appId: "1:1030508786015:web:4ea08670188a1899f586ea",
  measurementId: "G-TP37WLKS3R",
};

// DEBUG visible aussi en prod
if (typeof window !== 'undefined') {
  window.__FIREBASE_CONFIG__ = firebaseConfig;
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

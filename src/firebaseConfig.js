
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnAuky6WmJULohrGUQfisDMtNAJ4Bg1pM",
  authDomain: "arbre-genealogique-b43f6.firebaseapp.com",
  projectId: "arbre-genealogique-b43f6",
  storageBucket: "arbre-genealogique-b43f6.appspot.com",
  messagingSenderId: "1030508786015",
  appId: "1:1030508786015:web:4ea08670188a1899f586ea",
  measurementId: "G-TP37WLKS3R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

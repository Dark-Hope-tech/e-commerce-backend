import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCoCE2U27u6i_HwcwdvzNfjcOHO8tsCNGA",
  authDomain: "qamar-bhai.firebaseapp.com",
  projectId: "qamar-bhai",
  storageBucket: "qamar-bhai.appspot.com",
  messagingSenderId: "352995425635",
  appId: "1:352995425635:web:6a4ecd1a812596a744e756",
  measurementId: "G-SF1G7809GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { app, storage };

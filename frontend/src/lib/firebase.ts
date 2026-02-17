import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBkraVjcCWci0_W4OHQ5opBp5JwIhCVc1U",
    authDomain: "code-strikers.firebaseapp.com",
    projectId: "code-strikers",
    storageBucket: "code-strikers.firebasestorage.app",
    messagingSenderId: "649571240599",
    appId: "1:649571240599:web:cd8b3d031da20381d077d2",
    measurementId: "G-G5TKNG985R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);

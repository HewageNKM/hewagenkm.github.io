"use client";

import {FirebaseApp, initializeApp} from "firebase/app";
import {getAnalytics, isSupported} from "firebase/analytics";
import {Database, get, getDatabase, ref} from "@firebase/database";
import {Auth, getAuth, signInAnonymously} from "@firebase/auth";
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from "@firebase/app-check";
import {Project} from "@/interfaces";

// Firebase configuration object
const firebaseConfig = {
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if running in the client environment
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

if (typeof window !== "undefined") {
    app = initializeApp(firebaseConfig);

    initializeAppCheck(app, {
        //@ts-ignore
        provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
    });

    isSupported().then((yes) => yes ? getAnalytics(app!) : null);

    auth = getAuth(app);
    db = getDatabase(app);
}

// Function to get filter menu items
export const getFilterMenuItems = async () => {
    if (!db) return null; // Ensure db is defined

    try {
        const filterRef = ref(db, "filters");
        const dataSnapshot = await get(filterRef);
        return dataSnapshot.val();
    } catch (e) {
        console.error(e);
    }
};

// Function to get projects based on a filter
export const getProjects = async (filter: string) => {
    if (!db) return null; // Ensure db is defined

    try {
        const projectRef = ref(db, "projects");
        const filteredDataSnapshot = await get(projectRef);
        let projects: Project[] = filteredDataSnapshot.val() || [];

        switch (filter) {
            case "NextJS/React":
                const reactProjects = projects.filter((project: Project) => project.stack.includes("React"));
                const nextJSProjects = projects.filter((project: Project) => project.stack.includes("NextJS"));
                return [...reactProjects, ...nextJSProjects];
            case "React Native/Expo":
                const expoProjects = projects.filter((project: Project) => project.stack.includes("Expo"));
                const reactNativeProjects = projects.filter((project: Project) => project.stack.includes("React Native"));
                return [...expoProjects, ...reactNativeProjects];
            case "Jetpack Compose":
                return projects.filter((project: Project) => project.stack.includes("Jetpack Compose"));
            case "All":
                return projects;
            default:
                return [];
        }
    } catch (e) {
        console.error(e);
    }
};

// Function to log in a user anonymously
export const loginAnonymouslyUser = async () => {
    if (!auth) return null; // Ensure auth is defined

    try {
        return await signInAnonymously(auth);
    } catch (e) {
        console.error(e);
    }
};

// Function to get the current user
export const currentUser = () => {
    if (!auth) return null; // Ensure auth is defined

    try {
        return auth.currentUser;
    } catch (e) {
        console.error(e);
    }
};

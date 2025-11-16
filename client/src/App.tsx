import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email?.trim().toLowerCase();

        if (email && email.endsWith("@stratsync.ai")) {
          setIsLoggedIn(true);
          setShowLogin(false);
          setShowUnauthorized(false);
        } else {
          toast.error("Unauthorized email address", { autoClose: 1000 });
          auth.signOut();
          setIsLoggedIn(false);
          setShowUnauthorized(true);
          setShowLogin(true);
        }
      } else {
        setIsLoggedIn(false);
        setShowLogin(true);
        setShowUnauthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const email = result.user.email?.trim().toLowerCase();

      if (email && email.endsWith("@stratsync.ai")) {
        setIsLoggedIn(true);
        setShowLogin(false);
        setShowUnauthorized(false);
        toast.success("Google login successful!", { autoClose: 1000 });
      } else {
        toast.error("Unauthorized email address", { autoClose: 1000 });
        await auth.signOut();
        setIsLoggedIn(false);
        setShowUnauthorized(true);
        setShowLogin(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed!", { autoClose: 1000 });
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ToastContainer />

      <div
        className={`transition-all duration-300 ${
          showLogin || showUnauthorized ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <ChatWindow />
      </div>

      {(showLogin || showUnauthorized) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      )}

      <AnimatePresence>
        {showLogin && !isLoggedIn && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Welcome to StratSync
              </h2>
              <p className="text-gray-500 mb-8">
                Sign in to continue to your AI co-pilot for customer success and
                growth.
              </p>
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition font-medium shadow-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                Login with Google
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnauthorized && !isLoggedIn && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">
                Unauthorized Access!
              </h2>
              <p className="text-gray-600 mb-6">
                Please contact the StratSync team for assistance.
              </p>
              <button
                onClick={() => {
                  setShowUnauthorized(false);
                  setShowLogin(true);
                }}
                className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
              >
                Go Back to Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

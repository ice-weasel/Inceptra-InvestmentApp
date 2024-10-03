"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import "tailwindcss/tailwind.css";
import 'firebase/auth';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../lib/firebase'
import '../lib/firebase'
import { useRouter } from "next/navigation";


export default function Login() {
  const [isLoading, setisLoading] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
//getConfig() is depreciated
 
 const router = useRouter()

const handleClick = async () => {
  setisLoading(true);

  

  console.log("this is the email" , email)
  console.log("this is the password" ,password)
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
   

    // Send the token to your server to create a session cookie
    const response = await fetch('/api/login', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    console.log("works till here")


    if (response.ok) {
      router.push('/team')
    

    } else {
      console.error("Failed to log in");
    

    }
  } catch (error) {
    console.error("Error signing in", error);
  } finally {
    setisLoading(false);
  }
};

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-900">
      {/* Animated container */}
      <motion.div
        className="w-[300px] sm:w-[500px]  md:w-[650px] md:h-[450px]  p-8 gap-6 bg-white rounded-lg shadow-lg flex flex-col justify-center items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full h-full mt-7 ">
          <motion.h1
            className="text-3xl md:text-5xl pt-8 flex items-start w-full font-semi-bold text-black mb-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Login
          </motion.h1>

          <motion.div
            className="w-full flex flex-col space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeIn" }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              autoComplete="true"
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border-b border-gray-400  transition-all duration-300 focus:outline-rounded focus:outline-blue-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              autoComplete="autocomplete"
              onChange={(e)=> setPassword(e.target.value)}
              className="p-2 border-b border-gray-400 transition-all duration-300 focus:outline-rounded focus:outline-blue-600 focus:border-black"
            />
          </motion.div>
          {/* Login Button with loading effect */}
          <motion.button
            className={`mt-6 px-4 py-2 w-full relative rounded-lg focus:outline-none ${
              isLoading
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-gray-400 text-white"
            }`}
            onClick={handleClick}
            disabled={isLoading} // Disable button during loading
          >
            {isLoading ? (
              <motion.div
                className="absolute top-0 left-0 h-full rounded-lg bg-blue-700"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
              ></motion.div>
            ) : (
              "Login"
            )}

            {/* Keep text centered */}
            <span className="relative z-10">
              {isLoading ? "Loading..." : ""}
            </span>
          </motion.button>
        </div>
        {/* Login text */}

        {/* Input fields */}
      </motion.div>
    </div>
  );
}

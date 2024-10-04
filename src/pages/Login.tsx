/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import "tailwindcss/tailwind.css";
import 'firebase/auth';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../lib/firebase'
import '../lib/firebase'
import { useRouter } from "next/navigation";
import { dm, syne } from "@/components/InvestmentForm";




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
    <div className="w-screen h-screen flex justify-center items-center bg-[#1C45E5] px-6">
      {/* Animated container */}
     
      <div className={`w-screen md:w-1/3  rounded-xl bg-white border-2 flex-col gap-5 items-start border-black shadow-custom-2 flex px-5 py-6 ${syne.className}`}>
        <div className="text-4xl font-bold">Team Login</div>
        <div className="w-full flex flex-col items-start gap-4">
          <input
                type="email"
                placeholder="Email"
                value={email}
                required
                autoComplete="true"
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 shadow-custom-3 bg-white border-2 border-black rounded-full outline-none w-full px-4  "
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                autoComplete="autocomplete"
                onChange={(e)=> setPassword(e.target.value)}
                  className="p-3 shadow-custom-3 bg-white border-2 border-black rounded-full outline-none w-full px-4  "
              />
        </div>
        <button
          onClick={handleClick}
          disabled={isLoading}
        type="submit"
        className={`${syne.className} text-lg min-w-36 shadow-custom border-2 text-white border-black  bg-[#1C45E5] font-bold rounded-full flex justify-center items-center px-5 py-2 `}
       
      >
        {!isLoading ? 'Login' : 'Logging In...'}
      </button>
      </div>
     
    </div>
  );
}

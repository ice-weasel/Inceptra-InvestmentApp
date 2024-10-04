/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState , useEffect } from 'react';
import { useTeamData } from '../hooks/useTeamData';
import "tailwindcss/tailwind.css";

import { adminDb,getAdminDB } from '@/lib/firebaseAdmin';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { off, onValue, ref } from 'firebase/database';



import { Syne, DM_Sans } from 'next/font/google';
import { bebas } from '@/pages/team';

export const syne = Syne({
  weight: ["400"],
  style: ['normal'],
  subsets: ['latin'],
});

export const dm = DM_Sans({
  weight: ["400"],
  style: ['normal'],
  subsets: ['latin'],
});


export async function getServerSideProps(context: any) {
  const { req } = context;
  const sessionCookie = req.cookies["session"];



  if (!sessionCookie) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  return { props: { sessionCookie } };
}

export default function InvestmentForm({ teamId, currentBalance }: { teamId: string, currentBalance: number }) {
  const [targetTeam, setTargetTeam] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const { teams, makeInvestment, loading, error } = useTeamData();
  
  const router = useRouter()

  useEffect(() => {
    const investmentRef = ref(db, 'Investing'); // Reference to the investment status

    const unsubscribe = onValue(investmentRef, (snapshot) => {
      const investmentStatus = snapshot.val();
      if (investmentStatus === false) {
        router.push('/homePage'); // Redirect to homepage if investing is false
      }
    });

    // Cleanup on unmount
    return () => off(investmentRef); // Remove listener
  }, [router]);


  const validateAmount = (value: string) => {
    const numValue = Number(value);
    if (numValue < 50) {
      setAmountError('Minimum investment amount is 50');
    } else if (numValue > currentBalance) {
      setAmountError('Amount exceeds current balance');
    } else {
      setAmountError('');
    }
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeam || !amount || amountError) return;
    
    try {
      await makeInvestment(teamId, targetTeam, Number(amount));
      setTargetTeam('');
      setAmount('');
      alert('Investment successful!');
    } catch (err: any) {
      alert(`Investment failed: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 bg-[#8C57ED] flex flex-col px-4 py-6 border-black border-2 shadow-custom-2 rounded-xl ${syne.className}`}>
      <h2 className={`${bebas.className} tracking-wide text-3xl font-semibold `}>Make an Investment</h2>
      <div>
        <label htmlFor="targetTeam" className="font-semibold text-lg block mb-1">
          Invest in Team:
        </label>
        <select
          id="targetTeam"
          value={targetTeam}
          onChange={(e) => setTargetTeam(e.target.value)}
          className="w-full bg-[#b699eb] px-4 py-2 font-medium outline-none border-none rounded-full"
          required
        >
          <option value="">Select a team</option>
          {teams
            .filter((team: any) => team.id !== teamId)
            .map((team: any) => (
              <option key={team.id} value={team.id} className='font-medium tracking-tight'>
                {team.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="font-semibold text-lg block mb-1">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => validateAmount(e.target.value)}
          min="50"
          max={currentBalance}
          step="1"
          className="w-full bg-[#b699eb] px-4 py-2 border-black font-medium outline-none border-none rounded-full"
          required
        />
        {amountError && <p className="text-black underline underline-offset-2 mt-1">{amountError}</p>}
      </div>
      <button
        type="submit"
        className={`${syne.className} text-lg shadow-custom border-2 border-black  bg-[#FCDA66] font-bold rounded-full flex justify-center items-center px-5 py-2 `}
        disabled={loading || !!amountError}
      >
        {loading ? 'Investing...' : 'Make Investment'}
      </button>
      {error && <p className="text-black underline underline-offset-2">{error.message}</p>}
    </form>
  );
}
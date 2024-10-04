/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState , useEffect } from 'react';
import { useTeamData } from '../hooks/useTeamData';
import "tailwindcss/tailwind.css";
import { adminDb,getAdminDB } from '@/lib/firebaseAdmin';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { off, onValue, ref } from 'firebase/database';



export async function getServerSideProps(context: any) {
  const { req } = context;
  const sessionCookie = req.cookies["session"];



  if (!sessionCookie) {
    // Redirect to login if no session cookie
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  // Pass session data to the page
  return { props: { sessionCookie } };
}


export default function InvestmentForm({ teamId }:any) {
  const [targetTeam, setTargetTeam] = useState('');
  const [amount, setAmount] = useState('');
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


  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!targetTeam || !amount) return;
    
    try {
      await makeInvestment(teamId, targetTeam, Number(amount));
      setTargetTeam('');
      setAmount('');
      alert('Investment successful!');
    } catch (err:any) {
      alert(`Investment failed: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="targetTeam" className="block mb-1">
          Invest in Team:
        </label>
        <select
          id="targetTeam"
          value={targetTeam}
          onChange={(e) => setTargetTeam(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select a team</option>
          {teams
            .filter((team:any) => team.id !== teamId)
            .map((team:any) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="amount" className="block mb-1">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="1"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Investing...' : 'Make Investment'}
      </button>
      {error && <p className="text-red-500">{error.message}</p>}
    </form>
  );
}
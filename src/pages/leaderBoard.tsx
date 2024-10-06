/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import "tailwindcss/tailwind.css";
import { useTeamData } from '../hooks/useTeamData';
import { Reorder } from "framer-motion";
import { spice } from '@/lib/fonts';
import Image from 'next/image';
import backgroundImage from '../../public/bgImage.png';
import { bebas } from './team';
import { syne } from '@/components/InvestmentForm';
export default function Leaderboard() {
  const { teams, loading, error } = useTeamData();
  const [sortedTeams, setSortedTeams] = useState([]);

  interface Team {
    id: string;
    name: string;
    balance: number;
    investments: Record<string, number>;
    netreturns: number;
  }

  useEffect(() => {
    if (teams) {
      const sorted = [...teams].sort((a, b) => {
        const totalA = a.netreturns; // Directly use the numeric value
        const totalB = b.netreturns; // Directly use the numeric value
        return totalB - totalA; // Sorting in descending order
      });
      setSortedTeams(sorted as any);
    }
    
  }, [teams]);

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;

  return (
    <Layout >

     <div className={`${syne.className} bg-[#F0F0F0] px-6 md:px-24  py-14 w min-w-screen   min-h-screen h-full relative`}>
      <Image src={backgroundImage} alt='Theme Image' layout='fill' className=' absolute object-cover -z-10'/>
     <h1 className={ `${bebas.className} text-black  tracking-wide  text-5xl z-20 font-bold mb-6`}>Leaderboard</h1>
      <Reorder.Group as="table" axis="y" values={sortedTeams} onReorder={setSortedTeams} className="w-full z-20 border-collapse">
        <thead className='rounded-xl mb-3 overflow-hidden border-none stroke-none shadow-custom-2'>
          <tr className="bg-[#6d8aff8f] shadow-custom-2 border-black border-2  rounded-b-md overflow-hidden border-none stroke-none text-xl  rounded-xl">
            <th className=" rounded-t-lg  p-2 stroke-black stroke-1  shadow-custom-2">Rank</th>
            <th className="border rounded-t-lg p-2">Team</th>
            <th className="border rounded-t-lg p-2">Balance</th>
            <th className="border rounded-t-lg p-2">Investments</th>
            <th className="border rounded-t-lg p-2">Returns</th> 
          </tr>
        </thead>
        <tbody className='rounded-xl overflow-hidden mt-3'>
          {sortedTeams?.map((team : Team, index) => {
            const investmentsTotal: any = Object.values(team?.investments).reduce((sum: any, val: any) => sum + val, 0);
            const totalValue = team.balance + investmentsTotal;
            return (
              <Reorder.Item as="tr" key={team.id} value={team} className={index % 2 === 0 ? 'bg-gray-100   border-2  rounded-b-md mb-2 overflow-hidden text-xl' : ' text-xl rounded-b-md  mb-2 overflow-hidden'}>
                <td className={`  border p-2 text-center text-lg`}>{index + 1}</td>
                <td className={` border p-2 text-lg`}>{team.name}</td>
                <td className={`${bebas.className} text-center border p-2`}>${team.balance.toLocaleString()}</td>
                <td className={`${bebas.className} text-center border p-2`}>${investmentsTotal.toLocaleString()}</td>
                 <td className={`${bebas.className} text-center border p-2`}>${team?.netreturns ? team?.netreturns : 0}</td> 
              </Reorder.Item>
            );
          })}
        </tbody>
      </Reorder.Group>
     </div>
    </Layout>
  );
}


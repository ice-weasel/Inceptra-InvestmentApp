/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import "tailwindcss/tailwind.css";
import { useTeamData } from '../hooks/useTeamData';
import { Reorder } from "framer-motion";
import { spice } from '@/lib/fonts';
import Image from 'next/image';
import backgroundImage from '../../public/bgImage.png';
export default function Leaderboard() {
  const { teams, loading, error } = useTeamData();
  const [sortedTeams, setSortedTeams] = useState([]);

  useEffect(() => {
    if (teams) {
      const sorted = [...teams].sort((a, b) => {
        const totalA = a.balance + Object.values(a.investments).reduce((sum: any, val: any) => sum + val, 0);
        const totalB = b.balance + Object.values(b.investments).reduce((sum: any, val: any) => sum + val, 0);
        return totalB - totalA;
      });
      setSortedTeams(sorted as any);
    }
  }, [teams]);

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;

  return (
    <Layout >

     <div className='bg-[#F0F0F0] px-8 md:px-24  py-14 w-full h-full relative'>
      <Image src={backgroundImage} alt='Theme Image' layout='fill' className=' absolute object-cover -z-10'/>
     <h1 className={ `${spice.className} text-black  tracking-wide  text-5xl z-20 font-bold mb-6`}>Leaderboard</h1>
      <Reorder.Group as="table" axis="y" values={sortedTeams} onReorder={setSortedTeams} className="w-full z-20 border-collapse">
        <thead className='rounded-xl overflow-hidden border-none stroke-none'>
          <tr className="bg-red-200 overflow-hidden border-none stroke-none  rounded-xl">
            <th className="border rounded-t-lg p-2 stroke-none">Rank</th>
            <th className="border rounded-t-lg p-2">Team</th>
            <th className="border rounded-t-lg p-2">Balance</th>
            <th className="border rounded-t-lg p-2">Investments</th>
            <th className="border rounded-t-lg p-2">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams?.map((team, index) => {
            const investmentsTotal: any = Object.values(team.investments).reduce((sum: any, val: any) => sum + val, 0);
            const totalValue = team.balance + investmentsTotal;
            return (
              <Reorder.Item as="tr" key={team.id} value={team} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{team.name}</td>
                <td className="border p-2">${team.balance.toLocaleString()}</td>
                <td className="border p-2">${investmentsTotal.toLocaleString()}</td>
                <td className="border p-2">${totalValue.toLocaleString()}</td>
              </Reorder.Item>
            );
          })}
        </tbody>
      </Reorder.Group>
     </div>
    </Layout>
  );
}
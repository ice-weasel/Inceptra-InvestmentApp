/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import "tailwindcss/tailwind.css";
import { useTeamData } from '../hooks/useTeamData';
import { Reorder } from "framer-motion";

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
      setSortedTeams(sorted);
    }
  }, [teams]);

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <Reorder.Group as="table" axis="y" values={sortedTeams} onReorder={setSortedTeams} className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Rank</th>
            <th className="border p-2">Team</th>
            <th className="border p-2">Balance</th>
            <th className="border p-2">Investments</th>
            <th className="border p-2">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team, index) => {
            const investmentsTotal: any = Object.values(team?.investments).reduce((sum: any, val: any) => sum + val, 0);
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
    </Layout>
  );
}
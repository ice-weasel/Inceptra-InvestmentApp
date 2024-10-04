/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import "tailwindcss/tailwind.css";
import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useTeamData } from '../hooks/useTeamData';


export default function HomePage() {
  const { teams, loading, error } = useTeamData();

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Investment Competition</h1>
      <p className="mb-4">Welcome to our virtual investment competition! Each team starts with a fixed amount of virtual currency to invest in other teams.</p>
      
      <h2 className="text-2xl font-semibold mb-4">Participating Teams:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team:any) => (
          <Link key={team.id} href={`/team/${team.id}`}>
            <div className="border p-4 rounded hover:bg-gray-100 cursor-pointer">
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <p>Current Balance: ${team.balance}</p>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/leaderboard" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        View Leaderboard
      </Link>
    </Layout>
  );
}
import React from 'react';
import Link from 'next/link';
import "tailwindcss/tailwind.css";

export default function TeamCard({ team }:any) {
  const totalInvestments:any = Object.values(team.investments).reduce((sum:any, val:any) => sum + val, 0);
  const totalValue = team.balance + totalInvestments;

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
      <p className="mb-1">Balance: ${team.balance.toLocaleString()}</p>
      <p className="mb-1">Investments: ${totalInvestments.toLocaleString()}</p>
      <p className="mb-3 font-bold">Total Value: ${totalValue.toLocaleString()}</p>
      <Link 
        href={`/team/${team.id}`}
        className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        View Details
      </Link>
    </div>
  );
}
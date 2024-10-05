/* eslint-disable react-hooks/exhaustive-deps */
import { bebas } from '@/pages/team'
import React, { useMemo } from 'react'
import { syne } from './InvestmentForm'

// Array of background colors to choose from
const backgroundColors = [

  'bg-[#C1EA88]',
  'bg-[#FFB6C1]',
  'bg-[#87CEFA]',
  'bg-[#98FB98]',
  'bg-[#DDA0DD]',
  'bg-[#F0E68C]',
  'bg-[#E6E6FA]'
];

const TeamDet = ({teamName, balance}: {teamName: string, balance: string}) => {
  // Randomly select a background color
  const randomBgColor = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * backgroundColors.length);
    return backgroundColors[randomIndex];
  }, [teamName]); // Re-compute only if teamName changes

  return (
    <div className={`flex px-3 py-3 items-center gap-3 justify-between rounded-md ${randomBgColor} border-black border-2 shadow-custom-3`}>
      <div className={`${syne.className} font-bold`}>{teamName}</div>
      <div className={`${bebas.className} text-2xl`}>${balance.toLocaleString()}</div>
    </div>
  )
}

export default TeamDet
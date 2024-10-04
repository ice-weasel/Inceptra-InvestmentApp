import { useState, useEffect } from 'react';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../lib/firebase';
import "tailwindcss/tailwind.css"; // Ensure this path is correct for your project

// Define the structure of a team object
interface Team {
  id: string;
  name: string;
  balance: number;
  investments: { [key: string]: number };
  returns : { [key: string]: number }
}

interface UseTeamData {
  teams: Team[];
  loading: boolean;
  error: Error | null;
  getTeam: (id: string) => Team | undefined;
  makeInvestment: (fromTeamId: string, toTeamId: string, amount: number) => Promise<void>;
}

export function useTeamData(): UseTeamData {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(
      teamsRef,
      (snapshot) => {
        try {
          const teamsData = snapshot.val();

          // Ensure teamsData is an object before attempting to map it
          const teamsArray: Team[] = teamsData
            ? Object.entries(teamsData).map(([id, data]) => {
                if (typeof data === 'object' && data !== null) {
                  const teamData = data as Omit<Team, 'id'>; // Omit the id from the data
                  return {
                    id, // Add the id explicitly here
                    ...teamData, // Spread the rest of the team data
                  };
                } else {
                  throw new Error('Invalid team data');
                }
              })
            : [];
          
          setTeams(teamsArray);
          setLoading(false);
        } catch (err) {
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const getTeam = (id: string): Team | undefined => teams.find((team) => team.id === id);


  const makeInvestment = async (
    fromTeamId: string, 
    toTeamId: string, 
    amount: number, 
    profitPercentage: number = 0.1, // Set default values for demonstration
    time: number = 1
  ): Promise<void> => {
    if (fromTeamId === toTeamId) {
      throw new Error('Cannot invest in your own team');
    }
  
    const fromTeam = getTeam(fromTeamId);
    const toTeam = getTeam(toTeamId);
  
    const toTeamName = toTeam?.name || 'Default Team Name';
  
    if (!fromTeam || !toTeam) {
      throw new Error('Invalid team ID');
    }
  
    if (fromTeam.balance < amount) {
      throw new Error('Insufficient funds');
    }
  
    const fromTeamRef = ref(db, `teams/${fromTeamId}`);
    const toTeamRef = ref(db, `teams/${toTeamId}`);
    const transactionRef = ref(db, 'transactions');
  
    // Returns Calculation
    const calculateReturns = (
      fromTeam: Team,
      toTeam: Team,
      investmentAmount: number,
      profitPercentage: number,
      time: number
    ) => {
      const investmentsOut = Object.values(fromTeam.investments).reduce((acc, val) => acc + val, 0);
      const profitOnInvestment = investmentAmount * Math.pow(1 + profitPercentage, time);
      const returnsIn = Object.values(toTeam.investments).reduce((acc, val) => acc + val, 0);
      return profitOnInvestment + returnsIn - investmentsOut;
    };
  
    try {
      await set(fromTeamRef, {
        ...fromTeam,
        balance: fromTeam.balance - amount,
        investments: {
          ...fromTeam.investments,
          [toTeamName]: (fromTeam.investments[toTeamName] || 0) + amount,
        },
      });
  
      await set(toTeamRef, {
        ...toTeam,
        balance: toTeam.balance + amount,
      });
  
      await push(transactionRef, {
        from: fromTeamId,
        to: toTeamId,
        amount,
        timestamp: serverTimestamp(),
      });
  
      // Calculate the returns after the investment
      const returns = calculateReturns(fromTeam, toTeam, amount, profitPercentage, time);
      await set(fromTeamRef, {
        ...fromTeam,
        balance: fromTeam.balance - amount,
        investments: {
          ...fromTeam.investments,
          [toTeamName]: (fromTeam.investments[toTeamName] || 0) + amount,
        },
        returns: {
          ...fromTeam.returns, // Spread existing returns if any
          [toTeamId]: (fromTeam.returns?.[toTeamId] || 0) + returns, // Create or update the specific returns for this investment
        },
      });
      

      console.log(`Calculated returns for ${fromTeamId} after investing in ${toTeamId}: ${returns}`);
      
      // Optionally, you can store `returns` back into your database if needed.
      
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };
  
  return { teams, loading, error, getTeam, makeInvestment };
}

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


  const makeInvestment = async (fromTeamId: string, toTeamId: string, amount: number): Promise<void> => {
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

    try {
      // Update fromTeam's balance and investments
      await set(fromTeamRef, {
        ...fromTeam,
        balance: fromTeam.balance - amount,
        investments: {
          ...fromTeam.investments,
          [toTeamName]: (fromTeam.investments[toTeamName] || 0) + amount,
        },
        
      });

      // Update toTeam's balance
      await set(toTeamRef, {
        ...toTeam,
        balance: toTeam.balance + amount,
      });

      // Record the transaction
      await push(transactionRef, {
        from: fromTeamId,
        to: toTeamId,
        amount,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { teams, loading, error, getTeam, makeInvestment };
}

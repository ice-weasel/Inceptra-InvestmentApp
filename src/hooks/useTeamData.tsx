/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { ref, onValue, set, push, serverTimestamp } from "firebase/database";
import { db } from "../lib/firebase";
import "tailwindcss/tailwind.css"; // Ensure this path is correct for your project

// Define the structure of a team object
interface Team {
  teamId:string;
  id: string;
  name: string;
  balance: number;
  investments: { [key: string]: number };
  netreturns: number;
}

interface UseTeamData {
  teams: Team[];
  loading: boolean;
  error: Error | null;
  getTeam: (id: string) => Team | undefined;
  makeInvestment: (
    fromTeamId: string,
    toTeamId: string,
    amount: number
  ) => Promise<void>;
}

export function useTeamData(): UseTeamData {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const teamsRef = ref(db, "teams");
    const unsubscribe = onValue(
      teamsRef,
      (snapshot) => {
        try {
          const teamsData = snapshot.val();

          // Ensure teamsData is an object before attempting to map it
          const teamsArray: Team[] = teamsData
            ? Object.entries(teamsData).map(([id, data]) => {
                if (typeof data === "object" && data !== null) {
                  const teamData = data as Omit<Team, "id">; // Omit the id from the data
                  return {
                    id, // Add the id explicitlyhere
                    ...teamData, // Spread the rest of the team data
                  };
                } else {
                  throw new Error("Invalid team data");
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

  const getTeam = (id: string): Team | undefined =>
    teams.find((team) => team.teamId === id);

  const makeInvestment = async (
    fromTeamId: string,
    toTeamId: string,
    amount: number,
    profitPercentage: number = 0.1,
    time: number = 1
  ): Promise<void> => {
    if (fromTeamId === toTeamId) {
      throw new Error("Cannot invest in your own team");
    }

    const fromTeam = getTeam(fromTeamId);
    const toTeam = getTeam(toTeamId);

    if (!fromTeam || !toTeam) {
      throw new Error("Invalid team ID");
    }

    if (fromTeam.balance < amount) {
      throw new Error("Insufficient funds");
    }

    // Ensure `investments` and `netreturns` are initialized
    fromTeam.investments = fromTeam.investments || {};
    fromTeam.netreturns = fromTeam.netreturns || 0;

    const fromTeamRef = ref(db, `teams/${fromTeamId}`);
    const toTeamRef = ref(db, `teams/${toTeamId}`);
    const transactionRef = ref(db, "transactions");

    const investmentAmount = (fromTeam.investments[toTeam.name] || 0) + amount;
    if (isNaN(investmentAmount)) {
      throw new Error("Invalid investment amount");
    }

    // Function to calculate net returns for a team
    const calculateNetReturns = (team: Team): number => {
      const totalInvestmentsOut = Object.values(team.investments || {}).reduce(
        (acc, val) => acc + val,
        0
      );
      const totalInvestmentsIn = team.netreturns || 0; // Using netreturns as a single value (since it's no longer an object)

      // Net returns: incoming investments minus outgoing investments
      return totalInvestmentsIn - totalInvestmentsOut;
    };

    try {
      // Calculate the updated balance and net returns in one step
      const updatedBalance = fromTeam.balance - amount;

      // Set the new data in one `set` call to avoid overwriting issues
      await set(fromTeamRef, {
        ...fromTeam,
        balance: updatedBalance, // Update balance here
        investments: {
          ...fromTeam.investments,
          [toTeam.name]: (fromTeam.investments[toTeam.name] || 0) + amount, // Update investment amount in toTeam
        },
        netreturns: calculateNetReturns(fromTeam), // Store the calculated net returns
      });

      const calculatedNetReturns = calculateNetReturns(toTeam);
      console.log(
        `Calculated Net Returns for ${toTeam.id}:`,
        calculatedNetReturns
      );
      // Update toTeam balance in one go
      // Update toTeam's netreturns
      const updatedToTeam = {
        ...toTeam,
        balance: toTeam.balance + amount,
        netreturns: (toTeam.netreturns || 0) + amount, // Increment netreturns by the investment amount
      };

      await set(toTeamRef, updatedToTeam);

      // Log the transaction
      await push(transactionRef, {
        from: fromTeamId,
        to: toTeamId,
        amount,
        timestamp: serverTimestamp(),
      });

      console.log(
        `Investment made from ${fromTeamId} to ${toTeamId} for amount: ${amount}`
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { teams, loading, error, getTeam, makeInvestment };
}

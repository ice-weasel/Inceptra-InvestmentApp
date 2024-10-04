/* eslint-disable @typescript-eslint/no-unused-vars */
import "tailwindcss/tailwind.css";
import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import InvestmentForm from '../components/InvestmentForm';
import { useTeamData } from '../hooks/useTeamData';
import adminApp, { getAdminAuth } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { GetServerSideProps } from 'next';
import { adminDb } from '@/lib/firebaseAdmin';



export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionCookie = req.cookies["session"];

  if (!sessionCookie) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  try {
    // Verify the session cookie
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Fetch user data to get the teamId
    const userRef = adminDb.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData || !userData.teamId) {
      throw new Error('User has no associated team');
    }

    const teamId = userData.teamId;

    // Fetch basic team data
    const teamRef = adminDb.ref(`teams/${teamId}`);
    const teamSnapshot = await teamRef.once('value');
    const teamData = teamSnapshot.val();

    if (!teamData) {
      throw new Error('Team not found');
    }

    // Return teamId and basic team data
    return { 
      props: { 
        teamId,
        teamName: teamData.name,
        teamBalance: teamData.balance,
      } 
    };
  } catch (error) {
    console.error('Error verifying session:', error);
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }
}


interface TeamPageProps {
  teamId: string;
  teamName: string;
  teamBalance: number;
}


export default function TeamPage({ teamId, teamName, teamBalance }: TeamPageProps)  {
  const { getTeam, loading, error } = useTeamData();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/Login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred during logout', error);
    }
  };


  // Use the teamId obtained from server-side props
  const team = getTeam(teamId);

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;
  if (!team) return <Layout><p>Team not found</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">{team.name}</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Team Balance</h2>
        <p className="text-xl">${team.balance.toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Current Investments</h2>
        {Object.entries(team.investments).length > 0 ? (
          <ul>
            {Object.entries(team.investments).map(([teamId, amount]: any) => (
              <li key={teamId} className="mb-2">
                {teamId}: ${amount.toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No current investments</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-2">Make an Investment</h2>
      <InvestmentForm teamId={teamId} /> {/* Use the teamId passed as prop */}

      <button onClick={handleLogout} type="button" className="mt-4 bg-red-500 text-white p-2 rounded">
        Logout
      </button>
    </Layout>
  );
}

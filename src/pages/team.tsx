import "tailwindcss/tailwind.css";
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import InvestmentForm from '../components/InvestmentForm';
import { useTeamData } from '../hooks/useTeamData';
import adminApp from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function getServerSideProps(context: any) {
  const { req, params } = context;
  const sessionCookie = req.cookies["session"];

  if (!sessionCookie) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  // Verify the session cookie
  try {
    const decodedClaims = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    const teamId = decodedClaims.teamId; // Get the teamId from the decoded claims

    // If the URL team ID doesn't match the session team ID, redirect
    if (params.id !== teamId) {
      return {
        redirect: {
          destination: "/restricted", // Redirect to a restricted access page
          permanent: false,
        },
      };
    }

    return { props: { teamId, sessionCookie } }; // Pass teamId to the component

  } catch (error) {
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }
}

export default function TeamPage({ teamId }:any) {
  const { getTeam, loading, error } = useTeamData();

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
    </Layout>
  );
}

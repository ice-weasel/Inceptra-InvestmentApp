import "tailwindcss/tailwind.css";
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import InvestmentForm from '../../components/InvestmentForm';
import { useTeamData } from '../../hooks/useTeamData';


export async function getServerSideProps(context: any) {
  const { req } = context;
  const sessionCookie = req.cookies["session"];

  if (!sessionCookie) {
    // Redirect to login if no session cookie
    return {
      redirect: {
        destination: "/Login",
        permanent: false,
      },
    };
  }

  // Pass session data to the page
  return { props: { sessionCookie } };
}


export default function TeamPage() {
  const router = useRouter();
  const { id } = router.query;
  const { getTeam, loading, error } = useTeamData();

  const team = getTeam(id as string);

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
            {Object.entries(team.investments).map(([teamId, amount]:any) => (
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
      <InvestmentForm teamId={id} />
    </Layout>
  );
}
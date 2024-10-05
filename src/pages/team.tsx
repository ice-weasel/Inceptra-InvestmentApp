/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
import "tailwindcss/tailwind.css";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import InvestmentForm, { dm, syne } from '../components/InvestmentForm';
import { useTeamData } from '../hooks/useTeamData';
import adminApp, { getAdminAuth } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";
import { GetServerSideProps } from 'next';
import { adminDb } from '@/lib/firebaseAdmin';
import { Rock_Salt, Bebas_Neue,Familjen_Grotesk } from 'next/font/google'
import { spice } from "@/lib/fonts";
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Image from "next/image";
import goldCoin from '../../public/goldcoin.svg'
import TeamDet from "@/components/Teamdet";
export const rock = Rock_Salt({
  weight: ["400"],
  style: ['normal'],
  subsets: ['latin'],
});

export const bebas = Bebas_Neue({
  weight: ["400"],
  style: ['normal'],
  subsets: ['latin'],
});
export const familjen = Familjen_Grotesk({
  weight: ["400","500","600","700"],
  style: ['normal'],
  subsets: ['latin'],
});
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
    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    const userRef = adminDb.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData || !userData.teamId) {
      throw new Error('User has no associated team');
    }

    const teamId = userData.teamId;
    console.log("Team ID:", teamId); // For debugging

    const teamRef = adminDb.ref(`teams/${teamId}`);
    const teamSnapshot = await teamRef.once('value');

    console.log("Team Snapshot",teamSnapshot)
    
    // Check if teamSnapshot exists and retrieve teamData
    const teamData = teamSnapshot.val();

   

    // Logging to see the structure of teamData
    console.log("Team Data:", teamData);

    // Ensure investments is an object
    if (typeof teamData.investments !== 'object' || teamData.investments === null) {
      teamData.investments = {};
    }

    return { 
      props: { 
        teamId,
        teamName: teamData.name,
        teamBalance: teamData.balance,
        teamInvestments: teamData.investments // Pass investments as a prop if needed
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

export default function TeamPage({ teamId, teamName, teamBalance }: TeamPageProps) {
  const { getTeam, loading, error } = useTeamData();
  const router = useRouter();
  const [isInvestmentsOpen, setIsInvestmentsOpen] = useState(false);

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

  const team = getTeam(teamId);

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error.message}</p></Layout>;
  if (!team) return <Layout><p>Team not found</p></Layout>;

  return (
    <Layout>
      <div className="px-6 md:px-24 py-4 bg-[#F0F0F0] h-screen flex flex-col gap-2 ">
        <div className=" flex flex-col items-start gap-3 border-2 border-black shadow-custom-2 py-3 px-4 mb-3 rounded-xl">
        <div className="flex flex-col items-start  ">
          <h1 className={`${familjen.className} text-xl font-bold  `}>Team</h1>
        <h1 className={`${familjen.className} text-3xl font-bold mb-3 `}>{team.name}</h1>

        </div>
        {/* <h2 className="text-2xl font-semibold mb-2">Balance</h2> */}
        <div className={`${syne.className} mb-3 flex bg-[#17358D]  justify-center items-center h-36 shadow-custom-2 text-white rounded-xl w-full gap-3  py-2 `}>
       <div className="flex items-center gap-4">
       <div className="scale-[2]">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.0831 13.0005C25.0831 19.6746 19.6727 25.085 12.9986 25.085C12.1929 25.085 11.4058 25.0062 10.6442 24.8557C9.95243 24.7193 9.28184 24.5236 8.63793 24.2742C8.15044 24.0856 7.67819 23.8662 7.22364 23.6184C5.45171 22.6527 3.94817 21.2561 2.85384 19.5697C2.57415 19.1386 2.32103 18.6885 2.09718 18.2217C1.61045 17.2074 1.26103 16.1144 1.07336 14.9672C0.968541 14.3271 0.914062 13.6702 0.914062 13.0005C0.914062 6.32643 6.32447 0.916016 12.9986 0.916016C13.6683 0.916016 14.3251 0.970494 14.9652 1.07531C16.1125 1.26298 17.2054 1.6124 18.2198 2.09913C18.6865 2.32296 19.1366 2.5761 19.5677 2.85579C21.2542 3.95011 22.6508 5.45365 23.6165 7.2256C23.8643 7.68013 24.0837 8.15239 24.2723 8.63989C24.5216 9.28378 24.7174 9.95438 24.8538 10.6462C25.0042 11.4077 25.0831 12.1949 25.0831 13.0005Z" fill="#FFB93E"/>
    <path d="M12.9984 21.1632C17.5067 21.1632 21.1615 17.5084 21.1615 13.0001C21.1615 8.49168 17.5067 4.83691 12.9984 4.83691C8.48997 4.83691 4.83521 8.49168 4.83521 13.0001C4.83521 17.5084 8.48997 21.1632 12.9984 21.1632Z" fill="#FFD85C"/>
    <path opacity="0.24" d="M18.2204 2.09805L2.09779 18.2206C1.61106 17.2063 1.26164 16.1133 1.07397 14.9661L14.9658 1.07422C16.1131 1.2619 17.206 1.61131 18.2204 2.09805Z" fill="white"/>
    <path opacity="0.24" d="M23.6198 7.22526L7.22699 23.6181C5.45505 22.6524 3.95151 21.2558 2.85718 19.5693L19.571 2.85547C21.2575 3.94979 22.6541 5.45333 23.6198 7.22526Z" fill="white"/>
    <path opacity="0.24" d="M24.8574 10.646L10.6479 24.8555C9.9561 24.7191 9.28551 24.5233 8.6416 24.274L24.2759 8.63965C24.5252 9.28354 24.721 9.95415 24.8574 10.646Z" fill="white"/>
    <path d="M13 26C11.2454 26 9.54284 25.6562 7.93954 24.978C6.39139 24.3232 5.00122 23.386 3.80761 22.1924C2.61402 20.9988 1.6768 19.6086 1.02198 18.0605C0.343844 16.4572 0 14.7546 0 13C0 11.2454 0.343844 9.54284 1.02198 7.93954C1.67678 6.39139 2.614 5.00122 3.80761 3.80761C5.00122 2.61402 6.39139 1.6768 7.93954 1.02198C9.54284 0.343844 11.2454 0 13 0C14.7546 0 16.4572 0.343844 18.0605 1.02198C19.6086 1.67678 20.9988 2.614 22.1924 3.80761C23.386 5.00122 24.3232 6.39139 24.978 7.93954C25.6562 9.54284 26 11.2454 26 13C26 14.7546 25.6562 16.4572 24.978 18.0605C24.3232 19.6086 23.386 20.9988 22.1924 22.1924C20.9988 23.386 19.6086 24.3232 18.0605 24.978C16.4572 25.6562 14.7546 26 13 26ZM13 1.83099C11.4918 1.83099 10.0292 2.12616 8.65279 2.70833C7.32291 3.27082 6.12835 4.07627 5.10229 5.10233C4.07627 6.12836 3.27081 7.32292 2.70831 8.65282C2.12615 10.0292 1.83097 11.4918 1.83097 13C1.83097 14.5082 2.12615 15.9708 2.70831 17.3472C3.27081 18.6771 4.07627 19.8717 5.10229 20.8977C6.12833 21.9237 7.32291 22.7292 8.65279 23.2917C10.0292 23.8739 11.4918 24.169 13 24.169C14.5082 24.169 15.9708 23.8739 17.3472 23.2917C18.6771 22.7292 19.8717 21.9238 20.8977 20.8977C21.9237 19.8717 22.7292 18.6771 23.2917 17.3472C23.8739 15.9709 24.169 14.5082 24.169 13C24.169 11.4918 23.8739 10.0292 23.2917 8.65282C22.7292 7.32292 21.9237 6.12838 20.8977 5.10233C19.8717 4.07629 18.6771 3.27084 17.3472 2.70833C15.9708 2.12616 14.5082 1.83099 13 1.83099Z" fill="#38332B"/>
    <path d="M13.0006 21.8499C11.8062 21.8499 10.6472 21.6158 9.5557 21.1542C8.50179 20.7084 7.55544 20.0704 6.74291 19.2579C5.93039 18.4454 5.29238 17.499 4.84662 16.4451C4.38495 15.3536 4.15088 14.1945 4.15088 13.0002C4.15088 11.8057 4.38495 10.6467 4.84662 9.55521C5.29238 8.50131 5.93039 7.55495 6.74291 6.74242C7.55544 5.9299 8.50179 5.2919 9.5557 4.84614C10.6472 4.38448 11.8062 4.15039 13.0006 4.15039C14.195 4.15039 15.3541 4.38447 16.4456 4.84614C17.4995 5.2919 18.4458 5.92991 19.2584 6.74242C20.0709 7.55495 20.7089 8.50132 21.1547 9.55521C21.6163 10.6467 21.8504 11.8057 21.8504 13.0002C21.8504 14.1946 21.6163 15.3536 21.1547 16.4451C20.7089 17.499 20.0709 18.4454 19.2584 19.2579C18.4458 20.0704 17.4995 20.7084 16.4456 21.1542C15.3541 21.6158 14.195 21.8499 13.0006 21.8499ZM13.0006 5.52361C11.991 5.52361 11.0119 5.7212 10.0906 6.11087C9.20043 6.4874 8.40078 7.02657 7.71392 7.71344C7.02706 8.4003 6.48788 9.19994 6.11136 10.0901C5.72167 11.0115 5.5241 11.9905 5.5241 13.0001C5.5241 14.0098 5.72169 14.9888 6.11136 15.9101C6.48788 16.8003 7.02706 17.6 7.71392 18.2869C8.40078 18.9737 9.20043 19.5129 10.0906 19.8894C11.0119 20.2791 11.991 20.4767 13.0006 20.4767C14.0103 20.4767 14.9893 20.2791 15.9106 19.8894C16.8008 19.5129 17.6005 18.9737 18.2874 18.2869C18.9742 17.6 19.5134 16.8003 19.8899 15.9101C20.2796 14.9888 20.4772 14.0098 20.4772 13.0001C20.4772 11.9905 20.2796 11.0114 19.8899 10.0901C19.5134 9.19994 18.9742 8.4003 18.2874 7.71344C17.6005 7.02659 16.8008 6.48741 15.9106 6.11087C14.9893 5.7212 14.0103 5.52361 13.0006 5.52361Z" fill="#38332B"/>
    <path d="M12.9881 17.9896C12.7418 17.9896 12.5414 17.7892 12.5414 17.5429V17.0406C12.1987 17.0009 11.8777 16.918 11.585 16.7936C11.1489 16.6081 10.7913 16.3392 10.5221 15.9945C10.3465 15.7694 10.218 15.5152 10.14 15.2388C10.0952 15.0787 10.1269 14.9099 10.2271 14.7756C10.3295 14.6383 10.4861 14.558 10.657 14.5552L10.6868 14.5551C10.9294 14.5551 11.1398 14.7151 11.2101 14.9531C11.2557 15.1068 11.3274 15.2531 11.423 15.3877C11.5645 15.5855 11.7674 15.7452 12.0257 15.8618C12.1751 15.9292 12.3479 15.9781 12.5414 16.0078V13.3602L12.5101 13.3527C11.7737 13.1804 11.2117 12.9227 10.8405 12.5869C10.4528 12.2363 10.2563 11.7603 10.2563 11.1723V11.1672C10.2563 10.7157 10.3787 10.3158 10.6202 9.97861C10.8586 9.64641 11.1888 9.38538 11.6018 9.20265C11.8838 9.07786 12.1992 8.99549 12.5414 8.95711V8.45744C12.5414 8.33896 12.5875 8.227 12.6711 8.14221L12.6729 8.14047C12.7577 8.05682 12.8696 8.01074 12.9881 8.01074C13.2341 8.01074 13.4342 8.21114 13.4342 8.45744V8.95786C13.7644 8.99702 14.0721 9.08117 14.3509 9.20872C14.7557 9.39433 15.0879 9.65684 15.3386 9.98902C15.4958 10.1971 15.6119 10.4288 15.6839 10.6776C15.7307 10.8382 15.7012 11.0088 15.6029 11.1452C15.504 11.2824 15.3505 11.3648 15.1816 11.3713L15.1781 11.3714H15.1668C15.161 11.3716 15.1553 11.3717 15.1495 11.3717C14.906 11.3717 14.6915 11.2097 14.6279 10.9777C14.5847 10.822 14.5134 10.68 14.4161 10.5562C14.2694 10.3687 14.0741 10.2211 13.8354 10.1171C13.7122 10.0635 13.5779 10.0231 13.4342 9.99639V12.4814L13.5484 12.5084C14.3056 12.688 14.885 12.9468 15.2706 13.2774C15.6752 13.625 15.8803 14.1149 15.8803 14.7338V14.7389C15.8803 15.2331 15.7479 15.661 15.4867 16.0106C15.2292 16.356 14.8787 16.6225 14.445 16.8026C14.1371 16.9308 13.7978 17.0134 13.4342 17.0488V17.5429C13.4342 17.6614 13.3881 17.7734 13.3045 17.8582L13.3027 17.8599C13.2179 17.9435 13.1062 17.9896 12.9881 17.9896ZM13.4342 16.0212C13.6711 15.9955 13.8764 15.9454 14.0467 15.8716C14.2974 15.7633 14.4842 15.6136 14.6021 15.4263C14.7235 15.2345 14.7824 15.0225 14.7824 14.778V14.7722C14.7824 14.4703 14.6898 14.2339 14.4994 14.0495C14.3093 13.8658 13.9511 13.7061 13.4342 13.5742V16.0212ZM12.5414 9.99283C12.3713 10.0213 12.2178 10.067 12.0833 10.1294C11.8424 10.2408 11.6581 10.387 11.5352 10.5641C11.4134 10.7396 11.3543 10.9259 11.3543 11.1338V11.1389C11.3543 11.4156 11.4461 11.6406 11.6351 11.8269C11.8116 12.0003 12.116 12.1478 12.5415 12.2661V9.99283H12.5414Z" fill="#38332B"/>
    </svg>

          </div>
          <p className={`text-6xl ${bebas.className} ` }>${team.balance.toLocaleString()}</p>
       </div>
        </div>
        </div>

        <div className="gap-2 items-start bg-[#FEF5CC] border-black border-2 shadow-custom-2 text-black flex flex-col px-4 py-6 rounded-xl mb-3">
          <div 
            className="w-full flex justify-between items-center cursor-pointer" 
            onClick={() => setIsInvestmentsOpen(!isInvestmentsOpen)}
          >
            <h2 className={`${bebas.className} tracking-wide text-3xl font-semibold`}>Current Investments</h2>
            {isInvestmentsOpen ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
          </div>
          <AnimatePresence>
            {isInvestmentsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden"
              >
                {Object.entries(team.investments).length > 0 ? (
                  <ul className="mt-2 pb-2 flex gap-3 flex-col">
                    {Object.entries(team.investments).map(([teamId, amount]: any) => (
                      // <li key={teamId} className="mb-2">
                      //   {teamId}: ${amount.toLocaleString()}
                      // </li>
                      <TeamDet key={teamId} teamName={teamId} balance={amount}/>
                    ))}
                  </ul>
                ) : (
                  <p className={`${syne.className} font-bold mt-2`}>No current investments</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <InvestmentForm teamId={teamId}  currentBalance={team.balance}/>

        <button onClick={handleLogout} type="button" className={`${syne.className} text-lg w-fit shadow-custom border-2 border-black  bg-[#C1EA88] font-bold rounded-full flex justify-center items-center px-5 py-2 mt-8`}>
          Logout
        </button>
      </div>
    </Layout>
  );
}
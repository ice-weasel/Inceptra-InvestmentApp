import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from '@/lib/firebaseAdmin';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method not allowed
  }

  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // Session expiration

  try {
    console.log("Verifying ID token...");
    const decodedIdToken = await getAuth().verifyIdToken(idToken);
    const { uid } = decodedIdToken;
    console.log("ID token verified. Firebase UID:", uid);

    // Retrieve the user data directly using the Firebase UID
    const userRef = adminDb.ref(`users/${uid}`);
    const userSnapshot = await userRef.once('value');

    if (!userSnapshot.exists()) {
      console.log("User not found in database.");
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.val();
    const teamId = userData.teamId;
    console.log("Team ID associated with user:", teamId);

    if (!teamId) {
      console.log("No team associated with this user.");
      return res.status(404).json({ error: "No team associated with this user" });
    }

    // Fetch the team information using teamId
    const teamRef = adminDb.ref(`teams/${teamId}`);
    const teamSnapshot = await teamRef.once('value');

    if (!teamSnapshot.exists()) {
      console.log("Team not found in database.");
      return res.status(404).json({ error: "Team not found" });
    }

    const teamData = teamSnapshot.val();
    console.log("Team data retrieved successfully:", teamData);

    // Generate a session cookie
    const newSessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    res.setHeader(
      "Set-Cookie",
      `session=${newSessionCookie}; Max-Age=${expiresIn}; HttpOnly; Secure; Path=/`
    );
    console.log("New session cookie set.");

    // Return success with team data
    res.status(200).json({
      success: true,
      teamId,
      teamName: teamData.name,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(401).send("UNAUTHORIZED REQUEST!");
  }
}
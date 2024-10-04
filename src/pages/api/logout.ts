import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Set the session cookie with an expiration in the past
        res.setHeader("Set-Cookie", "session=; Max-Age=0; HttpOnly; Secure; Path=/");
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error in logout API:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
}

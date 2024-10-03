import { cookies } from "next/headers";
export default async function handler(req: any, res: any) {
    cookies().delete('session');
    res.status(200).json({ success: true });
}
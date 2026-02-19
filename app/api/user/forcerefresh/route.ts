import {NextRequest, NextResponse} from "next/server";
import {verifySession} from "@/lib/session";
import {createClient} from "redis";

export async function GET(req: NextRequest) {
  const session = await verifySession();

  if (session) {
    const client = createClient();
    await client.connect();

    await client.del(`inventory/${session.steamid}`);
    return NextResponse.json({success: true});
  }

  return NextResponse.json({success: false});
}
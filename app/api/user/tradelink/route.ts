import {NextRequest, NextResponse} from "next/server";
import {verifySession} from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({success: false, error: "Not authorized"});
  }

  const body: { tradelink: string } = await req.json();
  await prisma.user.update({
    where: { steamid: session.steamid},
    data: { tradelink: body.tradelink }
  })

  return NextResponse.json({success: true});
}
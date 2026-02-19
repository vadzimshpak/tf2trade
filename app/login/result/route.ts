'use server';

import {NextRequest, NextResponse} from "next/server";
import {createSession} from "@/lib/session";

export async function GET(req: NextRequest) {
  const steamid = req.nextUrl.searchParams.get('openid.claimed_id')?.split('/').pop()
  if (steamid)
    await createSession(steamid)

  return NextResponse.redirect(process.env.APPLICATION_URL || '/');
}
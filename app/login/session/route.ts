import {NextRequest, NextResponse} from "next/server";
import {verifySession} from "@/lib/session";

export async function GET(req: NextRequest) {

  return NextResponse.json(await verifySession());
}
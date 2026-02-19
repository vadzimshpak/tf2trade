import {NextRequest, NextResponse} from "next/server";

const STEAM_LOGIN = 'https://steamcommunity.com/openid/login';
const WEBHOOK_URL = process.env.STEAM_SIGNIN_WEBHOOK || 'http://localhost:3000/login/result';

export async function GET(request: NextRequest) {
  const params = {
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': WEBHOOK_URL,
    'openid.realm': WEBHOOK_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  };

  const params_encoded = new URLSearchParams(params).toString();

  return NextResponse.redirect(`${STEAM_LOGIN}?${params_encoded}`);
}
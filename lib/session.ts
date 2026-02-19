'server only';

import prisma from "@/lib/prisma";
import {jwtVerify, SignJWT} from "jose";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";


const key = new TextEncoder()
  .encode('LASKJDklasjdaslkdjlJLKJDFDLKS');

const cookieOptions = {
  name: 'session',
  options: {httpOnly: true, secure: true, sameSite: 'lax', path: '/'},
  duration: 24 * 60 * 60 * 1000
}

async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .sign(key)
}

async function decrypt(session: any) {
  try {
    const {payload} = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(steamid: string) {
  const expires = new Date(Date.now() + cookieOptions.duration);
  const session = await encrypt({ steamid, expires});


  await prisma.user.upsert({
    where: { steamid},
    update: {},
    create: { steamid},
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieOptions.name, session, {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: expires
  });
}
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookieOptions.name)?.value;
  const session = await decrypt(cookie);
  if (!session?.steamid) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      steamid: session.steamid
    }
  });
}
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieOptions.name);
  redirect('/');
}
import React from "react";
import {HeaderNav} from "@/src/layout/Header/HeaderNav";

import {verifySession} from "@/lib/session";
import {HeaderLogo} from "@/src/layout/Header/HeaderLogo";

export async function Header() {
  const user = await verifySession();

  return (
    <div className="header">
      <HeaderLogo />
      <HeaderNav user={user} />
    </div>
  )
}
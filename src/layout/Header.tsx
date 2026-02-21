import React from "react";
import {HeaderNav} from "@/src/layout/Header/HeaderNav";

import {verifySession} from "@/lib/session";
import {HeaderLogo} from "@/src/layout/Header/HeaderLogo";

export async function Header() {
  const user = await verifySession();
  const logo = process.env.LOGO;

  return (
    <div className="header">
      <HeaderLogo logo={logo || "LOGO"} />
      <HeaderNav user={user} />
    </div>
  )
}
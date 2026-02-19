'use client';

import {redirect} from "next/navigation";

export function HeaderLogo() {
  return (
    <div className="header__logo" onClick={() => redirect("/")}>
      LOGO
    </div>
  )
}
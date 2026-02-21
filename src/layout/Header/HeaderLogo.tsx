'use client';

import {redirect} from "next/navigation";

interface Props {
  logo: string;
}

export function HeaderLogo(props: Props) {
  return (
    <div className="header__logo" onClick={() => redirect("/")}>
      { props.logo }
    </div>
  )
}
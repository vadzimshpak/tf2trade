'use client';

import {redirect} from "next/navigation";
import Image from "next/image";

interface Props {
  logo: string;
}

export function HeaderLogo(props: Props) {
  return (
    <div className="header__logo" onClick={() => redirect("/")}>
      <Image src="/icons/logo-icon.webp" alt={props.logo} width={80} height={80} />
    </div>
  )
}
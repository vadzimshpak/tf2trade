import React from "react";
import Link from "next/link";

export function Footer() {
  const discord = process.env.DISCORD_LINK;

  return (
    <div className="footer">
      <div className=""></div>
      <div className="footer__links">
        <Link href="/">
          <img className="inline mr-2" src="/icons/logo-icon.webp" alt="Logo" width={25} height={25} />
          <span className="inline">  Home</span>
        </Link>
        {/*<Link href="/bots">Bots</Link>*/}
        <a href={discord} target="_blank">
          <img className="inline mr-2" src="/icons/discord.svg" alt="Logo" width={20} height={20} />
          <span className="inline">  Discord</span>
        </a>
        {/*<Link href="/about">About</Link>*/}
      </div>
      <div className="footer__copyright">
        Copyright © 2026  All rights reserved.
      </div>
    </div>
  )
}
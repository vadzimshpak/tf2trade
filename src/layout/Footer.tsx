import React from "react";
import Link from "next/link";

export function Footer() {
  const discord = process.env.DISCORD_LINK;

  return (
    <div className="footer">
      <div className=""></div>
      <div className="footer__links">
        <Link href="/">
          <span className="inline">  Home</span>
        </Link>
        {/*<Link href="/bots">Bots</Link>*/}
        <a href={discord} target="_blank">
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
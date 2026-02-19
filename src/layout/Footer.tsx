import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <div className="footer">
      <div className=""></div>
      <div className="footer__links">
        <Link href="/">Home</Link>
        <Link href="/bots">Bots</Link>
        <Link href="/discord">Discord</Link>
        <Link href="/about">About</Link>
      </div>
      <div className="footer__copyright">
        Copyright © 2026  All rights reserved.
      </div>
    </div>
  )
}
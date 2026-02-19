import type { Metadata } from "next";
import {ReduxProvider} from "@/src/store/ReduxProvider";
import {ProfileModal} from "@/src/layout/Modal/ProfileModal";

import "@/src/scss/_main.scss";

export const metadata: Metadata = {
  title: "TF2 Trading platform",
  description: "Trading platform for TF2 items",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider >
          <ProfileModal />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}

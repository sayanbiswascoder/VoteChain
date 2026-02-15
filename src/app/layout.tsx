import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // 👈 we will create this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoteChain",
  description: "VoteChain — Decentralized Voting on Sepolia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

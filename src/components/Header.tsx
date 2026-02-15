"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            VoteChain
          </Link>
          <nav className="hidden sm:flex gap-1">
            <NavLink href="/" active={pathname === "/"}>
              Home
            </NavLink>
            <NavLink
              href="/dashboard"
              active={pathname === "/dashboard"}
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
        <ConnectButton
          client={client}
          appMetadata={{
            name: "VoteChain",
            url: "https://votechain.app",
          }}
        />
      </div>
    </header>
  );
}
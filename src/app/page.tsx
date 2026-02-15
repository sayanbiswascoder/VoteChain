"use client";

import { useMemo } from "react";
import Header from "@/components/Header";
import VotingCard from "@/components/dashboard/VotingCard";
import { client } from "./client";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as string;

export default function Home() {
  const factoryContract = useMemo(
    () =>
      getContract({
        client,
        chain: sepolia,
        address: FACTORY_ADDRESS,
      }),
    []
  );

  const {
    data: allVotings,
    isLoading,
  } = useReadContract({
    contract: factoryContract,
    method: "function getAllVotings() view returns (address[])",
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[160px] animate-float" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] animate-float-delayed" />
        <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[160px] animate-float-slow" />
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              All Votings
            </span>
          </h1>
          <p className="mt-3 text-zinc-400 text-lg max-w-xl leading-relaxed">
            Explore and participate in decentralized voting on the Sepolia test
            network.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-10">
          <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm">
            <span className="text-zinc-500">Total: </span>
            <span className="text-white font-semibold">
              {allVotings?.length ?? "—"}
            </span>
          </div>
        </div>

        {/* Voting Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse"
              />
            ))}
          </div>
        ) : allVotings && allVotings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...allVotings].reverse().map((addr, i) => (
              <div
                key={addr}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <VotingCard address={addr} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <span className="text-4xl">🗳️</span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">
              No Votings Yet
            </h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Head to the Dashboard to create the first voting!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-xs text-zinc-600">
            VoteChain — Decentralized Voting on Sepolia •{" "}
            <span className="font-mono text-zinc-700">
              {FACTORY_ADDRESS.slice(0, 10)}…{FACTORY_ADDRESS.slice(-6)}
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}

"use client"

import { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import VotingCard from "@/components/dashboard/VotingCard";
import CreateVotingForm from "@/components/dashboard/CreateVotingForm";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract, useActiveAccount } from "thirdweb/react";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as string;

const factoryContract = getContract({
  client,
  chain: sepolia,
  address: FACTORY_ADDRESS,
});

/* ─── Stats card ─── */
function StatsCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-[1px] group`}
    >
      <div className="rounded-2xl bg-zinc-950/80 backdrop-blur-xl p-5 h-full flex items-center gap-4 transition-all duration-300 group-hover:bg-zinc-950/60">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-xl font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard Page — Only current user's votings ─── */
export default function Dashboard() {
  const account = useActiveAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: myVotings,
    isLoading,
    refetch,
  } = useReadContract({
    contract: factoryContract,
    method:
      "function getVotingsByCreator(address creator) view returns (address[])",
    params: [
      account?.address ?? "0x0000000000000000000000000000000000000000",
    ],
  });

  return (
    <>
      <Head>
        <title>My Dashboard | VoteChain</title>
        <meta
          name="description"
          content="Manage your decentralized votings on Sepolia"
        />
      </Head>

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
                My Dashboard
              </span>
            </h1>
            <p className="mt-3 text-zinc-400 text-lg max-w-xl leading-relaxed">
              Create and manage votings you&apos;ve deployed on Sepolia.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
            <StatsCard
              icon="🗳️"
              label="My Votings"
              value={myVotings?.length ?? "—"}
              gradient="from-purple-500/30 to-indigo-500/30"
            />
            <StatsCard
              icon="👛"
              label="Wallet"
              value={
                account
                  ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
                  : "Not Connected"
              }
              gradient="from-emerald-500/30 to-teal-500/30"
            />
          </div>

          {/* Create button */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">My Votings</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                {showCreateForm ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Voting
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="mb-10">
              <CreateVotingForm
                factoryContract={factoryContract}
                onSuccess={() => {
                  setShowCreateForm(false);
                  refetch();
                }}
              />
            </div>
          )}

          {/* My Votings Grid */}
          {!account ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <span className="text-4xl">👛</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Connect your wallet to view and manage your votings.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : myVotings && myVotings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...myVotings].reverse().map((addr, i) => (
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
                No Votings Created Yet
              </h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Create your first voting to get started!
              </p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                >
                  Create First Voting
                </button>
              )}
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
    </>
  );
}
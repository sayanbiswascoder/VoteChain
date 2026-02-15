"use client";

import { useState, useEffect, useMemo } from "react";
import { client } from "@/app/client";
import { getContract, readContract, prepareContractCall } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import {
  useReadContract,
  useSendTransaction,
  useActiveAccount,
} from "thirdweb/react";

type Candidate = {
  name: string;
  voteCount: number;
};

type VotingStatus = "upcoming" | "active" | "ended" | "finalized";

const STATUS_CONFIG: Record<
  VotingStatus,
  { label: string; color: string; dot: string; gradient: string }
> = {
  upcoming: {
    label: "Upcoming",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
    gradient: "from-amber-500 to-orange-500",
  },
  active: {
    label: "Active",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
  },
  ended: {
    label: "Ended",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    dot: "bg-rose-400",
    gradient: "from-rose-500 to-pink-500",
  },
  finalized: {
    label: "Finalized",
    color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    dot: "bg-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
};

function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(endTimestamp: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTimestamp - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function VotingCard({ address }: { address: string }) {
  const account = useActiveAccount();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: sepolia,
        address,
      }),
    [address]
  );

  const { data: title } = useReadContract({
    contract,
    method: "function title() view returns (string)",
  });

  const { data: startTime } = useReadContract({
    contract,
    method: "function startTime() view returns (uint256)",
  });

  const { data: endTime } = useReadContract({
    contract,
    method: "function endTime() view returns (uint256)",
  });

  const { data: finalized } = useReadContract({
    contract,
    method: "function finalized() view returns (bool)",
  });

  const { data: candidatesCount } = useReadContract({
    contract,
    method: "function candidatesCount() view returns (uint256)",
  });

  const { data: hasVoted } = useReadContract({
    contract,
    method: "function hasVoted(address) view returns (bool)",
    params: [
      account?.address ?? "0x0000000000000000000000000000000000000000",
    ],
  });

  const { data: creator } = useReadContract({
    contract,
    method: "function creator() view returns (address)",
  });

  const { mutate: sendTx, isPending: isVoting } = useSendTransaction();

  // Fetch all candidates once we know the count
  useEffect(() => {
    if (candidatesCount === undefined) return;
    const count = Number(candidatesCount);
    if (count === 0) {
      setLoadingCandidates(false);
      return;
    }

    let cancelled = false;
    async function fetchCandidates() {
      const result: Candidate[] = [];
      for (let i = 0; i < count; i++) {
        const [name, voteCount] = await readContract({
          contract,
          method:
            "function getCandidate(uint256 index) view returns (string name, uint256 voteCount)",
          params: [BigInt(i)],
        });
        result.push({ name, voteCount: Number(voteCount) });
      }
      if (!cancelled) {
        setCandidates(result);
        setLoadingCandidates(false);
      }
    }

    fetchCandidates();
    return () => {
      cancelled = true;
    };
  }, [candidatesCount, contract]);

  // Compute status
  const now = Math.floor(Date.now() / 1000);
  const start = Number(startTime ?? 0);
  const end = Number(endTime ?? 0);

  const status: VotingStatus = finalized
    ? "finalized"
    : now < start
      ? "upcoming"
      : now > end
        ? "ended"
        : "active";

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const maxVotes = Math.max(...candidates.map((c) => c.voteCount), 0);
  const remaining = status === "active" ? getTimeRemaining(end) : null;
  const sc = STATUS_CONFIG[status];

  const handleVote = () => {
    if (selectedCandidate === null) return;
    const tx = prepareContractCall({
      contract,
      method: "function vote(uint256 candidateIndex)",
      params: [BigInt(selectedCandidate)],
    });
    sendTx(tx);
  };

  const isCreator =
    account &&
    creator &&
    account.address.toLowerCase() === creator.toLowerCase();

  return (
    <div className="group relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] overflow-hidden transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-2xl hover:shadow-purple-500/[0.07] hover:-translate-y-1">
      {/* Gradient accent bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${sc.gradient} opacity-80`}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-semibold text-white truncate">
              {title ?? (
                <span className="inline-block w-32 h-5 bg-white/10 rounded animate-pulse" />
              )}
            </h3>
            {isCreator && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-purple-400/70 font-medium uppercase tracking-wider">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                You created this
              </span>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.color} shrink-0`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${status === "active" ? "animate-pulse" : ""}`}
            />
            {sc.label}
          </span>
        </div>

        {/* Time info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{start ? formatTime(start) : "—"}</span>
          </div>
          <span className="text-zinc-700">→</span>
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
            <span>{end ? formatTime(end) : "—"}</span>
          </div>
          {remaining && (
            <span className="ml-auto text-emerald-500/80 font-medium">
              ⏱ {remaining}
            </span>
          )}
        </div>

        {/* Candidates */}
        <div className="space-y-2.5 mb-5">
          {loadingCandidates ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-white/[0.03] animate-pulse"
                />
              ))}
            </>
          ) : (
            candidates.map((c, i) => {
              const pct =
                totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0;
              const isSelected = selectedCandidate === i;
              const isWinner =
                (status === "finalized" || status === "ended") &&
                c.voteCount === maxVotes &&
                c.voteCount > 0;
              const canSelect = status === "active" && !hasVoted && !!account;

              return (
                <button
                  key={i}
                  onClick={() =>
                    canSelect &&
                    setSelectedCandidate(isSelected ? null : i)
                  }
                  disabled={!canSelect}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? "bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10 scale-[1.01]"
                      : isWinner
                        ? "bg-emerald-500/[0.08] border-emerald-500/25"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                  } ${canSelect ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                      {isWinner && (
                        <span className="text-base leading-none">🏆</span>
                      )}
                      {c.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 tabular-nums font-medium">
                      {c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}
                      {totalVotes > 0 && (
                        <span className="text-zinc-600 ml-1">
                          ({pct.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isWinner
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : isSelected
                            ? "bg-gradient-to-r from-purple-500 to-indigo-400"
                            : "bg-gradient-to-r from-zinc-600 to-zinc-500"
                      }`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-600 font-medium">
              {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-zinc-700">•</span>
            <span className="text-[11px] text-zinc-600 font-mono">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>

          {status === "active" && !hasVoted && account ? (
            <button
              onClick={handleVote}
              disabled={selectedCandidate === null || isVoting}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {isVoting ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Voting…
                </span>
              ) : (
                "Cast Vote"
              )}
            </button>
          ) : hasVoted ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Voted
            </span>
          ) : status === "active" && !account ? (
            <span className="text-[11px] text-zinc-600 italic">
              Connect wallet to vote
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

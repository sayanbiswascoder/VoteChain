"use client";

import { useState } from "react";
import { prepareContractCall } from "thirdweb";
import type { ThirdwebContract } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";

interface Props {
  factoryContract: ThirdwebContract;
  onSuccess?: () => void;
}

export default function CreateVotingForm({ factoryContract, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const { mutate: sendTx, isPending } = useSendTransaction();

  const addCandidate = () => setCandidates([...candidates, ""]);

  const removeCandidate = (index: number) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index: number, value: string) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validCandidates = candidates.filter((c) => c.trim());
    if (validCandidates.length < 2) {
      setError("At least 2 candidates are required");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end times are required");
      return;
    }

    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    if (startTimestamp >= endTimestamp) {
      setError("End time must be after start time");
      return;
    }

    const tx = prepareContractCall({
      contract: factoryContract,
      method:
        "function createVoting(string title, string[] candidateNames, uint256 startTime, uint256 endTime) returns (address)",
      params: [
        title,
        validCandidates,
        BigInt(startTimestamp),
        BigInt(endTimestamp),
      ],
    });

    sendTx(tx, {
      onSuccess: () => {
        setTitle("");
        setCandidates(["", ""]);
        setStartDate("");
        setEndDate("");
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message || "Transaction failed");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-8 animate-slideDown"
    >
      {/* Form header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            Create New Voting
          </h3>
          <p className="text-xs text-zinc-500">
            Deploy a new voting contract on Sepolia
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 flex items-center gap-2">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Voting Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Best Framework 2026"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
            required
          />
        </div>

        {/* Candidates */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Candidates{" "}
            <span className="text-zinc-600 font-normal">(min 2)</span>
          </label>
          <div className="space-y-2.5">
            {candidates.map((c, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => updateCandidate(i, e.target.value)}
                    placeholder={`Candidate name`}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200"
                    required
                  />
                </div>
                {candidates.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeCandidate(i)}
                    className="w-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-500 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addCandidate}
            className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/10 text-zinc-500 text-sm font-medium hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Candidate
          </button>
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200 [color-scheme:dark]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200 [color-scheme:dark]"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              Deploying Contract…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Deploy Voting Contract
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

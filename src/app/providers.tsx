"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "./client";
import { sepolia } from "thirdweb/chains";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider client={client} activeChain={sepolia}>
      {children}
    </ThirdwebProvider>
  );
}
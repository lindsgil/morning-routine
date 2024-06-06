'use client'

import * as React from 'react';
import {
    getDefaultConfig,
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
    RainbowKitSiweNextAuthProvider,
  } from "@rainbow-me/rainbowkit-siwe-next-auth";
import {
    SessionProvider
} from "next-auth/react";
import { WagmiProvider } from 'wagmi';
import {
    base
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { useHasMounted } from '@/hooks/use-has-mounted'

const queryClient = new QueryClient() 

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: "store-of-value",
    projectId: "edfc64dca258cce84debdb61167bee1b",
    wallets: [
        ...wallets
    ],
    chains: [
        base
    ],
    ssr: true
});

const getSiweMessageOptions = () => ({
    statement: "Sign in to Morning Routine by BASEMENT"
})

export function Providers({ children }) {
    const mounted = useHasMounted();
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <RainbowKitSiweNextAuthProvider
                    getSiweMessageOptions={getSiweMessageOptions}
                >
                    <RainbowKitProvider>
                        {mounted && children}
                    </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }
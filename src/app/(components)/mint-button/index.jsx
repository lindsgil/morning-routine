'use client'
import React from 'react';
import { usePublicClient, useWalletClient } from 'wagmi'
import { Button } from '../button';
import { CONTRACT_ADDRESS, CONTRACT_ABIS } from '@/utils/constants';
import { parseEther } from 'viem';
import { submitOnChain } from '@/app/(actions)/submit-on-chain';
import { useToast } from '../toast/use-toast';
import { MINT_START_TIME, MINT_END_TIME } from '@/utils/constants';

const MintButton = () => {
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const { toast } = useToast()
    const account = walletClient?.account?.address
    const currentTime = Math.floor(Date.now() / 1000);
    const isMintPeriod = (currentTime >= MINT_START_TIME && currentTime <= MINT_END_TIME)

    const handleBidSubmit = async() => {

        const transactionInputs = {
            contractAddress: CONTRACT_ADDRESS,
            contractAbi: CONTRACT_ABIS.safeMint,
            contractFunctionName: "safeMint",
            transactionArgs: [account],
            transactionValue: parseEther("0.005")
        }
    
        const data = await submitOnChain(transactionInputs, walletClient, publicClient)

        if (data?.status === "ERROR") {
            toast({
                description: "Error minting",
            })
        } else {
            toast({
                description: "Mint successful",
            })
        }
    }

    return (
        <div>
            <Button className="w-[100px] bg-blue text-white" onClick={handleBidSubmit} disabled={!account || !isMintPeriod}>
                MINT
            </Button>
        </div>
    );
};

export default MintButton;

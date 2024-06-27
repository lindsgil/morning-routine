import { getFrameMessage } from '@coinbase/onchainkit/frame';
import { encodeFunctionData } from 'viem';
import { ethers } from 'ethers';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';
import { NextResponse } from 'next/server';

const neynarApiKey = process.env.NEYNAR_API_KEY ?? ""

export async function POST(req) {
    try {
        const body = await req.json();
        const tokenId = body?.untrustedData?.inputText;
        const tokenIdNumber = parseInt(tokenId)
        const { isValid, message } = await getFrameMessage(body, { neynarApiKey: neynarApiKey });

        if (!isValid || !(tokenIdNumber >= 0)) {
            return new NextResponse("Error with frame", {status: 500});
        }

        const data = encodeFunctionData({
            abi: FULL_CONTRACT_ABI,
            functionName: 'checkIn',
            args: [tokenIdNumber]
        });

        const txData = {
            chainId: `eip155:${base.id}`,
            method: 'eth_sendTransaction',
            params: {
              abi: [],
              data,
              to: CONTRACT_ADDRESS,
              value: ethers.parseEther('0').toString(), // 0 ETH
            },
        };

        return NextResponse.json(txData);
    } catch (error) {
        console.log("error: ", error)
        return new NextResponse("Error checking in", {status: 500});
    }
}

export const dynamic = 'force-dynamic';
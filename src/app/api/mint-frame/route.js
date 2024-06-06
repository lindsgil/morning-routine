import { getFrameMessage } from '@coinbase/onchainkit/frame';
import { encodeFunctionData } from 'viem';
import { ethers } from 'ethers';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';

export async function POST(req) {
    try {
        const body = await req.json();
        const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'C4CC8097-0790-4690-88BB-D74507A83821' });
        if (!isValid) {
            return new Response(JSON.stringify({ message: "Error with frame" }), {status: 500});
        }

        console.log("message from frame: ", message)
        const toAddress = message?.interactor?.verified_addresses?.eth_addresses?.[0]
        console.log("to address: ", toAddress)

        if (!toAddress) {
            console.log("Error: No user address")
            return new Response(JSON.stringify({ message: "Error completing tx" }), {status: 500});
        }
        const data = encodeFunctionData({
            abi: FULL_CONTRACT_ABI,
            functionName: 'safeMint',
            args: [toAddress]
        });

        const txData = {
            chainId: `eip155:${base.id}`,
            method: 'eth_sendTransaction',
            params: {
              abi: [],
              data,
              to: CONTRACT_ADDRESS,
              value: ethers.formatEther('5000000'), // 0.005 ETH
            },
        };

        return new Response(JSON.stringify({txData}), {status: 200});
    } catch (error) {
        console.log("error: ", error)
        return new Response(JSON.stringify({ message: "Error completing project" }), {status: 500});
    }
}

export const dynamic = 'force-dynamic';
import { getFrameMessage } from '@coinbase/onchainkit/frame';
import { encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';

export async function POST(req) {
    try {
        const body = await req.json();
        const { isValid, message } = await getFrameMessage(body);

        if (!isValid) {
            return new Response(JSON.stringify({ message: "Error with frame" }), {status: 500});
        }

        const data = encodeFunctionData({
            abi: FULL_CONTRACT_ABI,
            functionName: 'checkIn',
        });

        const txData = {
            chainId: `eip155:${base.id}`,
            method: 'eth_sendTransaction',
            params: {
              abi: [],
              data,
              to: CONTRACT_ADDRESS,
              value: parseGwei('0').toString(), // 0 ETH
            },
        };

        return new Response(JSON.stringify({txData}), {status: 200});
    } catch (error) {
        console.log("error: ", error)
        return new Response(JSON.stringify({ message: "Error completing project" }), {status: 500});
    }
}
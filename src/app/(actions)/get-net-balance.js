'use server'

import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';
import { ethers } from 'ethers';

const providerURL = process.env.PROVIDER_URL ?? ""

const provider = new ethers.JsonRpcProvider(providerURL);
 
const contractAddress = CONTRACT_ADDRESS;
const contractABI = FULL_CONTRACT_ABI;

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export async function getNetBalance(tokenId) {

    try {
        const totalBalance = await contract.totalProceeds();
        const totalBalanceEth = ethers.formatEther(totalBalance.toString());
        const netBalance = parseFloat(totalBalanceEth) * 0.75;
        const currInvocations = await contract.totalInvocations()
        return { status: "OK", data: { netBalance: netBalance?.toString(), currInvocations: currInvocations?.toString() } }
    } catch(error) {
        console.log("error: ", error)
        return { status: "ERROR", error: { message: "Call failed" } }
    }
}
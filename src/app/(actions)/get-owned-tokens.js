'use server'

import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';
import { ethers } from 'ethers';

const providerURL = process.env.PROVIDER_URL ?? ""

const provider = new ethers.JsonRpcProvider(providerURL);

const contractAddress = CONTRACT_ADDRESS;
const contractABI = FULL_CONTRACT_ABI;

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export async function getOwnedTokens(walletAddress) {

    try {
        const currTokenIds = [];
        const totalBalanceOf = await contract.balanceOf(walletAddress) || 0
        const totalBalanceString = totalBalanceOf?.toString();
        
        if (parseInt(totalBalanceString) > 0) {
            for (let i = 0; i < parseInt(totalBalanceString); i++) {
                let currTokenId = await contract.tokenOfOwnerByIndex(walletAddress, i)
                currTokenIds.push(currTokenId?.toString())
            }
        }
        return { status: "OK", data: { tokenIds: currTokenIds } }
    } catch(error) {
        console.log("error: ", error)
        return { status: "ERROR", error: { message: "Call failed" } }
    }
}
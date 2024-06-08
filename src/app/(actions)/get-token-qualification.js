'use server'

import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from '@/utils/constants';
import { ethers } from 'ethers';

const providerURL = process.env.PROVIDER_URL ?? ""

const provider = new ethers.JsonRpcProvider(providerURL);
 
const contractAddress = CONTRACT_ADDRESS;
const contractABI = FULL_CONTRACT_ABI;

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export async function getTokenQualification(tokenId) {

    try {
        const isTokenQualified = await contract.tokenIdToTokenQualified(tokenId);
        const lastCheckInTimestamp = await contract.tokenIdToLastInteractionTimestamp(tokenId);
        return { status: "OK", data: { isQualified: isTokenQualified, lastCheckIn: lastCheckInTimestamp?.toString() } }
    } catch (error) {
        console.log("ERROR: ", error)
        return { status: "ERROR", error: { message: "Call failed." } }
    }
}
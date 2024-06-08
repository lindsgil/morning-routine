'use client'
import React, { useState, useEffect } from 'react';

import AudioRecorder from "../(components)/audio-recorder";
import BackgroundTextAnimation from '../(components)/background-animation';
import { Input } from '../(components)/input';
import Link from 'next/link';
import { MINT_END_TIME } from '@/utils/constants';
import { getOwnedTokens } from '../(actions)/get-owned-tokens';
import { useWalletClient } from 'wagmi';

export default function CheckIn() {
    const { data: walletClient } = useWalletClient()
    const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})
    const [ownedTokenIds, setOwnedTokenIds] = useState([])
    const [currTokenId, setCurrTokenId] = useState("")
    const userAddress = walletClient?.account?.address;
    const handleTokenIdOnChange = (e) => {
        setCurrTokenId(e.target.value)
      }

    useEffect(() => {
        async function fetchOwnedTokens() {
            if (userAddress) {
                const { data } = await getOwnedTokens(userAddress);
                if (data) {
                    setOwnedTokenIds(data?.tokenIds)
                }
            }
        }
        fetchOwnedTokens();
        // calculate remaining time in hours
        const calculateRemainingTime = () => {
            const currentTime = Math.floor(Date.now() / 1000); // epoch seconds
            if (currentTime <= MINT_END_TIME) {
                // mint hasnt started yet, calculate remaining time til mint
                const remainingSeconds = MINT_END_TIME - currentTime;
                const remainingDays = Math.floor(remainingSeconds / (3600 * 24))
                const remainingHours = Math.floor((remainingSeconds % (3600 * 24)) / 3600)

                setRemainingTime({ days: remainingDays, hours: remainingHours })
            } else {
                setRemainingTime({ days: null, hours: null})
            }
        }
        // calculate every minute
        calculateRemainingTime();
        const intervalId = setInterval(calculateRemainingTime, 60000)
        // cleanup on unmount
        return () => clearInterval(intervalId)
    }, [userAddress])

    return (
        <div>
            <BackgroundTextAnimation />
            <div className="flex h-full overflow-hidden z-0 mb-[100px]">
                <div className="text-center py-[30px] mt-[100px] px-[50px] mx-auto max-w-full flex flex-col justify-between z-50 bg-white bg-opacity-90">
                    <div className="font-monumentbold tracking-wide font-bold md:text-[50px] text-[20px] whitespace-nowrap">
                        CHECK IN
                    </div>
                    {remainingTime.days !== null && remainingTime.hours !== null ? (
                        <div>
                            {`Game starts in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
                        </div>
                    ): (
                        <>
                            <div className="md:text-lg text-sm text-left font-sans mt-[30px] md:w-[600px] w-full">
                                Input your token ID below.
                                <br />
                                When you&apos;re ready press &apos;Start recording&apos; and scream into your microphone.
                                <br />
                                When you&apos;re finished press &apos;Stop recording&apos;.
                                <br />
                                To review your audio press &apos;play&apos;.
                                <br />
                                When you&apos;re happy with your submission click &apos;GM&apos; to finish checking in (this will trigger an on-chain transaction).
                                <br />
                                See you tomorrow.
                            </div>
                            <div className="md:text-lg text-sm text-left font-sans mt-[30px] md:w-[600px] w-full">
                                {ownedTokenIds && ownedTokenIds?.length > 0 ? (
                                    <div>
                                        Note - You own the following token Ids:
                                        { ownedTokenIds.map(tokenId => (<div key={tokenId}>{`${tokenId} `}</div>))}</div>
                                ): (
                                    <div>Note - It doesn&apos;t look like you own any tokens, try connecting with a different wallet.</div>
                                )}
                            </div>
                            <div className="mx-auto">
                                <Input
                                    id="currTokenId"
                                    placeholder="Token ID"
                                    value={currTokenId}
                                    onChange={handleTokenIdOnChange}
                                    className="w-[200px] mt-[20px]"
                                />
                            </div>
                            <AudioRecorder tokenId={currTokenId} />
                            <div className="md:text-lg text-sm text-left font-sans mt-[50px]">
                                To check if a token is still qualified visit <Link href="/token-check" className="underline">this page</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client'
import React, { useState, useEffect } from 'react';
import MintButton from '../mint-button';
import { getNetBalance } from '@/app/(actions)/get-net-balance';
import {
    MINT_START_TIME,
    MINT_END_TIME,
    GAME_START_TIME
} from '@/utils/constants';

export function PostMintInfo() {
    const [currInvocations, setCurrInvocations] = useState(0)
    const [currQualified, setCurrQualified] = useState(0)
    
    useEffect(() => {
        async function fetchBalance() {
            const { data } = await getNetBalance()
            if (data) {
                setCurrQualified(data?.numQualified)
                setCurrInvocations(data?.currInvocations)
            }
        }
        fetchBalance();
    }, []);

    const gameStartDate = new Date(GAME_START_TIME * 1000)
    const currentDate = new Date();
    const diffMs = currentDate - gameStartDate;
    const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const numDisqualified = parseInt(currInvocations) - parseInt(currQualified)
    return (
        <div className="lg:w-[800px] w-full mx-auto md:text-lg text-sm">
            <tbody className="md:hidden">
                <tr>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">❌ Disqualifed ❌</td>
                    <td>{numDisqualified}</td>
                </tr>
                <tr>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">🟢 Qualified 🟢</td>
                    <td>{currQualified}</td>
                </tr>
                <tr>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">🗓️ Days 🗓️</td>
                    <td>{elapsedDays}</td>
                </tr>
                <tr>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">💰 Total Pool 💰</td>
                    <td>0.0675 Ξ</td>
                </tr>
            </tbody>
            <tbody className="hidden md:block">
                <tr>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">❌ Disqualifed ❌</td>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">🟢 Qualified 🟢</td>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">🗓️ Days 🗓️</td>
                    <td className="font-monumentbold tracking-wide font-bold px-[20px]">💰 Total Pool 💰</td>
                </tr>
                <tr>
                    <td>{numDisqualified}</td>
                    <td>{currQualified}</td>
                    <td>{elapsedDays}</td>
                    <td>0.0675 Ξ</td>
                </tr>
            </tbody>
        </div>
    )
}

export function PreGameInfo() {
    const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})

    useEffect(() => {
        // calculate remaining time in hours
        const calculateRemainingTime = () => {
            const currentTime = Math.floor(Date.now() / 1000); // epoch seconds
            if (currentTime <= GAME_START_TIME) {
                // mint hasnt started yet, calculate remaining time til mint
                const remainingSeconds = GAME_START_TIME - currentTime;
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
    }, [])

    return (
        <div>
            <div className="flex h-full overflow-hidden md:text-lg text-sm text-center font-sans">
                <div className="md:px-[50px] px-[20px] mx-auto max-w-full flex flex-col justify-between">
                    {remainingTime.days !== null && remainingTime.hours !== null && (
                        <div>
                            {`Game starts in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export function PreMintInfo() {
    const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})

    useEffect(() => {
        // calculate remaining time in hours
        const calculateRemainingTime = () => {
            const currentTime = Math.floor(Date.now() / 1000); // epoch seconds
            if (currentTime <= MINT_START_TIME) {
                // mint hasnt started yet, calculate remaining time til mint
                const remainingSeconds = MINT_START_TIME - currentTime;
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
    }, [])

    return (
        <div>
            <div className="flex h-full overflow-hidden md:text-lg text-sm text-center font-sans">
                <div className="md:px-[50px] px-[20px] mx-auto max-w-full flex flex-col justify-between">
                    {remainingTime.days !== null && remainingTime.hours !== null && (
                        <div>
                            {`Minting starts in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
                        </div>
                    )}
                    <div>
                        Minting will be open for 7 days, priced at 0.005 Ξ on 🔵 Base
                    </div>
                </div>
            </div>
        </div>
    );

}

export default function Mint() {
    const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})
    const [currBalance, setCurrBalance] = useState(0)
    const [currInvocations, setCurrInvocations] = useState(0)

    useEffect(() => {
        async function fetchBalance() {
            const { data } = await getNetBalance()
            if (data) {
                setCurrBalance(data?.netBalance)
                setCurrInvocations(data?.currInvocations)
            }
        }
        fetchBalance(); 
        // calculate remaining time in hours
        const calculateRemainingTime = () => {
            const currentTime = Math.floor(Date.now() / 1000); // epoch seconds
            if (currentTime >= MINT_START_TIME && currentTime <= MINT_END_TIME) {
                // mint is ongoing, calculate remaining time
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
    }, [])

    return (
        <div>
            <div className="flex h-full overflow-hidden md:text-lg text-sm text-center font-sans">
                <div className="md:px-[50px] px-[20px] mx-auto max-w-full flex flex-col justify-between">
                    {remainingTime.days !== null && remainingTime.hours !== null && (
                        <div>
                            {`Mint ends in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
                        </div>
                    )}
                    <div className="flex items-center justify-center font-bold my-[20px] space-x-[20px]">
                        <span> 0.005 Ξ </span>
                        <MintButton />
                    </div>
                    <div>
                        Total invocations: {currInvocations}
                    </div>
                    <div>
                        Total pot: {currBalance} Ξ
                    </div>
                </div>
            </div>
        </div>
    );
}
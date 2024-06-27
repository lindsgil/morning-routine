'use client'
import React, { useState, useEffect } from 'react';
import { getTokenQualification } from '../(actions)/get-token-qualification';
import { Input } from '../(components)/input';
import { Button } from '../(components)/button';
import { MINT_END_TIME } from '@/utils/constants';
import { useWalletClient } from 'wagmi';
import { getOwnedTokens } from '../(actions)/get-owned-tokens';

export default function TokenChecker() {
  const { data: walletClient } = useWalletClient();
  const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})
  const [ownedTokenIds, setOwnedTokenIds] = useState([])
  const [tokenId, setTokenId] = useState(0);
  const [tokenData, setTokenData] = useState(null)
  const userAddress = walletClient?.account?.address;

  const handleTokenIdOnChange = (e) => {
    setTokenId(e.target.value)
  }

  const formatDate = (unixTimestamp) => {
    if (unixTimestamp) {
      const currDate = new Date(unixTimestamp * 1000)?.toISOString()
      return currDate
    } else {
      return ""
    }
  }

  const handleCheckToken = async() => {
    const tokenData = {}
    const data = await getTokenQualification(Number(tokenId))

    if (data.status === "OK") {
      tokenData.isQualified = data.data.isQualified
      tokenData.lastCheckIn = formatDate(data.data.lastCheckIn)
      tokenData.tokenId = tokenId
      setTokenData(tokenData)
    }
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
      <div className="flex h-full overflow-hidden z-0">
        <div className="text-center py-[30px] mt-[100px] px-[50px] mx-auto max-w-full flex flex-col justify-between z-50 bg-white bg-opacity-90">
            <div className="font-monumentbold tracking-wide font-bold md:text-[50px] text-[20px] whitespace-nowrap">
                TOKEN CHECKER
            </div>
          {remainingTime.days !== null && remainingTime.hours !== null ? (
            <div>
              {`Game starts in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
            </div>
          ): (
            <>
              <div className="md:text-lg text-sm text-left font-sans mt-[30px] md:w-[600px] w-full">
                Check if a token is qualified by ID.
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
              <div className="flex space-x-4 mt-[20px]">
                <Input
                    id="tokenId" 
                    placeholder="Token ID"
                    value={tokenId} 
                    onChange={handleTokenIdOnChange}
                />
                <Button className="w-[150px] bg-blue text-white" onClick={handleCheckToken}>
                    CHECK TOKEN
                </Button>
              </div>
              {tokenData !== null ? (
                <div className="md:text-lg text-sm text-left font-sans mt-[30px] md:w-[600px] w-full">
                  <div>Morning Routine # {tokenData.tokenId}</div>
                  <div>Last check in: {tokenData.lastCheckIn}</div>
                  <div>Qualified? {`${tokenData.isQualified}`}</div>
                  <div>Remember to check tokens in daily</div>
                </div>
            ) : null}
            </>
            )}
        </div>
      </div>
    </div>
  );
}

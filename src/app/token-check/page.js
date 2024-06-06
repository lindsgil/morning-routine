'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getTokenQualification } from '../(actions)/get-token-qualification';
import { Input } from '../(components)/input';
import { Button } from '../(components)/button';
import { GAME_START_TIME } from '@/utils/constants';

const DisqualifiedSVG = () => {
  return (
    <div>
      <Image
        src="/disqualified.svg"
        alt="Disqualified"
        width={600}
        height={600}
      />
    </div>
  );
};

const QualifiedSVG = () => {
  return (
    <div>
      <Image
        src="/qualified.svg"
        alt="Qualified"
        width={600}
        height={600}
      />
    </div>
  );
};


export default function TokenChecker() {
  const [remainingTime, setRemainingTime] = useState({ days: null, hours: null})
  const [tokenId, setTokenId] = useState(0);
  const [tokenData, setTokenData] = useState(null)

  const handleTokenIdOnChange = (e) => {
    setTokenId(e.target.value)
  }

  const handleCheckToken = async() => {
    const tokenData = {}
    const data = await getTokenQualification(Number(tokenId))

    if (data.status === "OK") {
      tokenData.isQualified = data.data.isQualified
      tokenData.lastCheckIn = data.data.lastCheckIn
      tokenData.tokenId = tokenId
      tokenData.image = data.data.isQualified ? <QualifiedSVG /> : <DisqualifiedSVG />

      setTokenData(tokenData)
    }
  }

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
      <div className="flex h-full overflow-hidden z-0">
        <div className="text-center py-[30px] mt-[100px] px-[50px] mx-auto max-w-full flex flex-col justify-between z-50 bg-white bg-opacity-90">
            <div className="font-monumentbold tracking-wide font-bold md:text-[50px] text-[20px] whitespace-nowrap">
                TOKEN CHECKER
            </div>
          {tokenData !== null ? (
            <div>
              <span>Morning Routine {tokenData.tokenId}</span>
              <span>Last check in: {tokenData.lastCheckIn}</span>
              <span>Qualified? {tokenData.isQualified}</span>
              <div>{tokenData.image}</div>
            </div>
          ) : null}
          {remainingTime.days !== null && remainingTime.hours !== null ? (
            <div>
              {`Game starts in ${remainingTime.days} ${remainingTime.days == 1 ? "day" : "days"} and ${remainingTime.hours} ${remainingTime.hours == 1 ? "hour" : "hours"}`}
            </div>
          ): (
            <>
              <div className="md:text-lg text-sm text-left font-sans mt-[30px] md:w-[600px] w-full">
                Check if a token is qualified by ID.
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
            </>
            )}
        </div>
      </div>
    </div>
  );
}

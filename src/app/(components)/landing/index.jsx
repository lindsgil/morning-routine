'use client'
import React from 'react';
import Link from 'next/link';
import Mint, { PostMintInfo, PreGameInfo, PreMintInfo } from '../mint';
import { GAME_START_TIME, MINT_END_TIME, MINT_START_TIME } from '@/utils/constants';
import Image from 'next/image';

const Landing = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    return (
        <div className="flex h-full overflow-hidden z-0">
        <div className="text-center pt-[30px] mt-[100px] px-[50px] mx-auto max-w-full flex flex-col justify-between z-50 bg-white bg-opacity-90">
            <div className="font-monumentbold tracking-wide font-bold md:text-[50px] text-[20px] whitespace-nowrap">
                MORNING ROUTINE
            </div>
            <div className="font-monumentbold tracking-wide font-bold md:text-[25px] text-[16px] whitespace-nowrap mb-[30px]">
                A game by BASEMENT
            </div>
            {currentTime < MINT_START_TIME ? (<PreMintInfo />) : null }
            {currentTime >= MINT_START_TIME && currentTime <= MINT_END_TIME ? (<Mint />) : null }
            {currentTime >= MINT_END_TIME && currentTime <= GAME_START_TIME ? <PreGameInfo /> : null}
            {currentTime > GAME_START_TIME ? (<PostMintInfo />) : null }
            <div className="text-left font-monumentbold tracking-wide font-bold md:text-[25px] text-[16px] whitespace-nowrap md:pl-[0px] pl-[20px] mt-[30px]">
                INFO
            </div>
            <div className='md:px-0 px-[20px] text-left font-sans md:text-lg text-sm mt-[24px] mb-[32px] lg:w-[800px] w-full break-words mx-auto text-center'>
                <ol className='list-disc text-left'>
                    <li>The game starts when minting closes. All tokens start out qualified.</li>
                    <li>Check in by visiting &nbsp;<Link href="/check-in" className="underline">this page</Link>&nbsp; and <Image src={'/scream.gif'} height={20} width={20} alt="scream-gif" className="md:inline hidden" /> screaming  <Image src={'/scream.gif'} height={20} width={20} alt="scream-gif" className="md:inline hidden" /> into your microphone daily to stay qualified.</li>
                    <li>Whoever stays qualified the longest wins the net proceeds from mint.</li>
                    <li>Check in will trigger an on-chain transaction.</li>
                    <li>Check in can be performed any time of day.</li>
                    <li>GM && GL</li>
                </ol>
                <br />
                <Link className='underline' href="https://basescan.org/address/0xFb4E63b86F0C55b90757e4426f09deB0D6e9b25f" target='_blank'>Contract on Etherscan</Link>
            </div>
        </div>
      </div>
    );
};

export default Landing;

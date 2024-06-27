## Morning Routine

Morning Routine is a tontine-style game developed by BASEMENT. The game emphasizes the importance of a consistent morning routine, which is often touted as a key to success.

### Game Overview
#### Minting and Participation

Minting for the game was open from June 6th through June 13th, 2024 on Base for 0.005 ETH. Participants who minted a token during this period qualified for the game. To remain qualified, token holders must check in daily by visiting www.morning-routine.xyz and screaming into their microphone. Alternatively, participants can play through frames in Warpcaster or by checking in on the contract directly (screaming not required). Each check-in prompts an on-chain transaction. The last holder to maintain their check-in streak wins the net proceeds from the mint.

#### Community Engagement

In addition to the website, there is an active community channel on Warpcaster with nearly 300 members at https://warpcast.com/~/channel/morning-routine. Here, participants share gm's along with their morning routines. Instructions and frames to play the game are pinned in the channel.

#### Code Structure

This repository contains the following components:
- Next.js Website (App Router): The main application, hosted on Vercel and accessible at www.morning-routine.xyz
- Frames: Code to display the game through frames using Coinbase's onchainkit is included within this repository.
- Smart Contracts: The solidity smart contract and applicable tests are located in the `/contracts` directory. The contract handles the game logic, including the daily check-in, qualification status, and payment distribution. The images for the token metadata are uploaded to AR Weave. These images and token features dynamically reflect the status of the tokens (qualified, disqualified, and winning). Additionally, the contracts directory contains tests for the contract and a detailed README that provides instructions for running the tests and deploying. The contract is deployed at: https://basescan.org/address/0xFb4E63b86F0C55b90757e4426f09deB0D6e9b25f

#### Installation Instructions

1. Clone the repository
2. Install dependencies with yarn: `yarn install`
3. Run the development server `yarn run dev`


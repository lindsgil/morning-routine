import { GAME_START_TIME, CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from "@/utils/constants";
import satori from 'satori'
import sharp from "sharp";
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

export const dynamic = "force-dynamic";

const providerURL = process.env.PROVIDER_URL ?? ""

const provider = new ethers.JsonRpcProvider(providerURL);

const contractAddress = CONTRACT_ADDRESS;
const contractABI = FULL_CONTRACT_ABI;

const contract = new ethers.Contract(contractAddress, contractABI, provider);

export async function GET(req) {
    try {

        const fontPath = path.join(process.cwd(), 'public', 'MonumentExtended-Regular.otf')
        let fontData = fs.readFileSync(fontPath)
        const numQualified = await contract.numQualified();

        const gameStartDate = new Date(GAME_START_TIME * 1000)
        const currentDate = new Date();
        const diffMs = currentDate - gameStartDate;
        const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const numDays = elapsedDays >= 0 ? elapsedDays : 0
    
        const svg = await satori(
            <div style={{ color: 'blue', height: "600px", width: "600px", backgroundColor: 'white', display: 'flex', flexDirection: 'column', fontSize: '36px' }}>
                <div style={{ display: 'flex', marginTop: '75px', marginLeft: '40px' }}>
                    MORNING ROUTINE
                </div>
                <div style={{ display: 'flex', marginTop: '120px', marginLeft: '40px' }}>
                    <span>Days: </span>
                    <span>{numDays}</span>
                </div>
                <div style={{ display: 'flex', marginTop: '50px', marginLeft: '40px' }}>
                    <span>Qualified tokens: </span>
                    <span>{numQualified.toString()}</span>
                </div>
                <div style={{ display: 'flex', marginTop: '50px', marginLeft: '40px' }}>
                    <span>Total pot: </span>
                    <span>0.0675 ETH</span>
                </div>
            </div>,
            {
                width: 600,
                height: 600,
                fonts: [{
                    data: fontData,
                    name: 'MonumentExt',
                    style: 'normal',
                    weight: 400
                }]
            }
        )
    
        const pngBuffer = await sharp(Buffer.from(svg)).toFormat('png').toBuffer()
    
        return new Response(pngBuffer, {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "max-age=10"
            }
        })
    } catch (error) {
        console.log("error: ", error)
        return new Response(JSON.stringify({ message: "Error with game stats image" }), {status: 500});
    }
}
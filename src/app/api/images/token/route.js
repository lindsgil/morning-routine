import { CONTRACT_ADDRESS, FULL_CONTRACT_ABI } from "@/utils/constants";
import satori from 'satori'
import sharp from "sharp";
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

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

        const tokenId = req.nextUrl.searchParams.get("tokenId")
        const lastCheckIn = await contract.tokenIdToLastInteractionTimestamp(parseInt(tokenId))
        const tokenIsQualified = await contract.tokenIdToTokenQualified(parseInt(tokenId))
        const lastCheckInNum = parseInt(lastCheckIn.toString())
        const lastCheckInFormatted = lastCheckInNum > 0 ? new Date(lastCheckInNum * 1000)?.toISOString() : "N/A"
        const svg = await satori(
            <div style={{ color: 'blue', height: "600px", width: "600px", backgroundColor: 'white', display: 'flex', flexDirection: 'column', fontSize: '24px' }}>
                <div style={{ display: 'flex', marginTop: '75px', marginLeft: '40px'  }}>
                    MORNING ROUTINE
                </div>
                <div style={{ display: 'flex', marginTop: '120px', marginLeft: '40px'  }}>
                    <span>Token ID: </span>
                    <span>{ tokenId }</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '50px', marginLeft: '40px'  }}>
                    <span>Last Check In: </span>
                    <span>{ lastCheckInFormatted }</span>
                </div>
                <div style={{ display: 'flex', marginTop: '50px', marginLeft: '40px' }}>
                    <span>Qualified: </span>
                    <span>{ `${tokenIsQualified}` }</span>
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
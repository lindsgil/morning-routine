import { getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const neynarApiKey = process.env.NEYNAR_API_KEY ?? ""

export async function POST(req) {
    const body = await req.json();
    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: neynarApiKey });

    if (!isValid) {
        return new Response('Message not valid', { status: 500 });
    }

    return new Response(
        getFrameHtmlResponse({
            image: {
                src: `${publicUrl}/success.png`,
                aspectRatio: '1:1',
            }
        }),
    );
}

export const dynamic = 'force-dynamic';
import { getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export async function POST(req) {
    const body = await req.json();
    const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'C4CC8097-0790-4690-88BB-D74507A83821' });

    if (!isValid) {
        return new Response('Message not valid', { status: 500 });
    }

    console.log("message: ", message)
    const tokenId = message?.input || "0"

    return new Response(
        getFrameHtmlResponse({
            image: {
                src: `${publicUrl}/api/images/token?tokenId=${tokenId}`,
                aspectRatio: '1:1',
            }
        }),
    );
}

export const dynamic = 'force-dynamic';
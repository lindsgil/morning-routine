import { getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export async function POST(req) {
    const body = await req.json();
    const { isValid, message } = await getFrameMessage(body);

    if (!isValid) {
        return new Response('Message not valid', { status: 500 });
    }

    return new Response(
        getFrameHtmlResponse({
            image: {
                src: `${publicUrl}/button.webp`,
                aspectRatio: '1:1',
            }
        }),
    );
}

export const dynamic = 'force-dynamic';
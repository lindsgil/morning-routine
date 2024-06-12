import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
        label: 'Game stats',
        target: `${publicUrl}/api/game-stats-frame`,
        postUrl: `${publicUrl}/api/website-link`
    }, {
        label: 'Token stats by ID',
        target: `${publicUrl}/api/token-stats-frame`,
        postUrl: `${publicUrl}/api/website-link`
    }
  ],
  image: {
    src: `${publicUrl}/open_mouth.png`,
    aspectRatio: '1:1',
  },
  input: {
    text: 'Token ID'
  },
  postUrl: `${publicUrl}/api/website-link`,
});

export const metadata = {
    title: 'Morning Routine',
    description: "Morning Routine by BASEMENT",
    openGraph: {
        title: 'Morning Routine',
        description: "Morning Routine by BASEMENT",
        images: [`${publicUrl}/open_mouth.png`],
      },
      other: {
        ...frameMetadata,
      },
};

export default function Page() {
  return (
    <div>
        hi
    </div>
  );
}
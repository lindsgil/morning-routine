import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'tx',
      label: 'Mint',
      target: `${publicUrl}/api/mint-frame`,
      postUrl: `${publicUrl}/api/after-mint`
    }
  ],
  image: {
    src: `${publicUrl}/qualified.gif`,
    aspectRatio: '1:1',
  },
  postUrl: `${publicUrl}/api/after-mint`,
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

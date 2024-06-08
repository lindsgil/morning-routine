import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'tx',
      label: 'Check In',
      target: `${publicUrl}/api/check-in-frame`,
      postUrl: `${publicUrl}/api/after-check-in`
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
import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      action: 'tx',
      label: 'Check In',
      target: `${publicUrl}/api/check-in-frame`,
    }
  ],
  image: {
    src: `${publicUrl}/button.webp`,
    aspectRatio: '1:1',
  },
  postUrl: `${publicUrl}/api/after-check-in`,
});

export const metadata = {
  title: 'Check In',
  description: "Check In",
  openGraph: {
    title: 'Check In',
    description: "Check In",
    images: [`${publicUrl}/button.webp`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
    </>
  );
}
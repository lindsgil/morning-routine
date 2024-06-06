import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const imageUrl = `${publicUrl}/api/current-stats`;

const frameMetadata = getFrameMetadata({
  image: {
    src: imageUrl,
    aspectRatio: '1:1',
  }
});

export const metadata = {
  title: 'Stats',
  description: "Stats",
  openGraph: {
    title: 'Stats',
    description: "Stats",
    images: [imageUrl],
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
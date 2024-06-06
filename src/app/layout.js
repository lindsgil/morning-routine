import { Inter } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "./providers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/app/(components)/toast/toaster"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Morning Routine",
  description: "Morning Routine by BASEMENT",
  openGraph: {
    title: 'Morning Routine',
    description: "Morning Routine by BASEMENT",
    url: 'https://morning-routine.xyz',
    siteName: 'morning-routine.xyz',
    images: [
      {
        url: 'https://ofuugsqhocbcivcazq6a3bj4gv76gn7i7766zduzcidsycgbyt4a.arweave.net/cWlDSgdwgiRUQMw8DYU8NX_jN-j__eyOmRIHLAjBxPg',
        width: 1200,
        height: 1200,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="h-full w-full">
            <div className="flex justify-end fixed right-0 p-[20px] z-50">
              <ConnectButton />
            </div>
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

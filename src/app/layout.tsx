import '@/app/globals.css';
import Header from '@/components/common/Header';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import { SettingsProvider } from '@/lib/SettingsProvider';
import { FirebaseAuthProvider } from '@/lib/firebase/auth';
import { FavConfigProvider } from '@/lib/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FavRec',
  description: 'Record your favorites and remember them forever.',
  applicationName: 'FavRec',
  authors: [
    {
      name: 'smallkirby',
      url: 'https://smallkirby.com',
    },
  ],
  metadataBase: new URL('https://fav.smallkirby.com'),
  openGraph: {
    title: 'FavRec',
    description: 'Record your favorites and remember them forever.',
    type: 'website',
    url: 'https://fav.smallkirby.com',
    images: [
      {
        url: 'img/favrec-og.png',
        alt: 'FavRec',
        width: 597,
        height: 222,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@smallkirby',
    creator: '@smallkirby',
    title: 'FavRec',
    description: 'Record your favorites and remember them forever.',
    images: {
      url: 'img/favrec-og.png',
      alt: 'FavRec',
      width: 597,
      height: 222,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <StyledComponentsRegistry>
        <FavConfigProvider>
          <SettingsProvider>
            <FirebaseAuthProvider>
              <body className="flex min-h-screen flex-col bg-slate-800 text-slate-300">
                <Header />
                <div className="mx-1 mb-8 mt-4 flex-1 px-2 md:mx-auto md:w-2/3">
                  {children}
                </div>
              </body>
            </FirebaseAuthProvider>
          </SettingsProvider>
        </FavConfigProvider>
      </StyledComponentsRegistry>
    </html>
  );
}

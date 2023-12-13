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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <StyledComponentsRegistry>
        <SettingsProvider>
          <FavConfigProvider>
            <FirebaseAuthProvider>
              <body className="flex min-h-screen flex-col dark:bg-slate-800 dark:text-slate-300">
                <Header />
                <div className="mx-1 mb-8 mt-4 flex-1 px-2 md:mx-auto md:w-2/3">
                  {children}
                </div>
              </body>
            </FirebaseAuthProvider>
          </FavConfigProvider>
        </SettingsProvider>
      </StyledComponentsRegistry>
    </html>
  );
}

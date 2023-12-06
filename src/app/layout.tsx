import '@/app/globals.css';
import Header from '@/components/common/Header';
import { FirebaseAuthProvider } from '@/lib/firebase/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FavRecorder',
  description: 'TODO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <FirebaseAuthProvider>
        <body className="flex min-h-screen flex-col">
          <Header />
          <div className="mx-1 mb-8 flex-1 px-2 md:mx-auto md:w-2/3">
            {children}
          </div>
        </body>
      </FirebaseAuthProvider>
    </html>
  );
}

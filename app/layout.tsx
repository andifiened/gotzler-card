import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Andreas Gotzler – KI-Visitenkarte',
  description:
    'Senior Frontend Developer & UX Designer auf dem Weg zum IT Automation & KI-Manager. Sprich jetzt mit meinem KI-Assistenten.',
  openGraph: {
    title: 'Andreas Gotzler – KI-Visitenkarte',
    description:
      'Klick auf den Button und frag meinen KI-Assistenten alles über meinen Werdegang.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

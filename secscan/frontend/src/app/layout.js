import './globals.css';

export const metadata = {
  title: 'SecScan — Web Security Scanner',
  description: 'Modern web güvenlik tarama aracı. Port, Header, TLS, XSS, SQLi, CVE analizi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-dark-950 text-dark-200 antialiased">
        {children}
      </body>
    </html>
  );
}

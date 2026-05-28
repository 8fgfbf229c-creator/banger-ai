import "./globals.css";

export const metadata = {
  title: "Banger.AI — Viral TikTok Concept Engine",
  description: "Generate viral TikTok concepts with AI-powered scene brainstorming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

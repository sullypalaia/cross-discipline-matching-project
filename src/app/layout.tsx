import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlanticus",
  description: "Find meaningful collaborations across Cal Poly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}

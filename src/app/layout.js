import { Inter } from 'next/font/google'; // Example using Google Fonts
import './globals.css';

// ================================================================
// THE ROOT LAYOUT: src/app/layout.js
// ================================================================
// This component wraps EVERY page on your site.
// ================================================================

// Initialize your font. This is the modern Next.js way to handle fonts.
const inter = Inter({ subsets: ['latin'] });

// --- METADATA ---
// This is the default metadata for your entire site.
// Pages can override this with their own `generateMetadata` function.
export const metadata = {
    title: 'Aryorithm - Next-Gen AI Solutions',
    description: 'Welcome to the Aryorithm official website.',
};


export default function RootLayout({ children }) {
    return (
        // The `lang` attribute is important for accessibility and SEO.
        <html lang="en">
        {/*
        The `className` from next/font helps optimize font loading.
        The `children` prop here will be the layout or page for the
        specific route the user is visiting. For example, on a docs page,
        `children` will be your `DocsLayout`. On your homepage, `children`
        will be your homepage's `page.js`.
      */}
        <body className={inter.className}>
        {/*
          You could put a global site-wide header or footer here if you had one
          that should appear on EVERY single page, including docs.

          Example:
          <GlobalSiteHeader />
        */}

        {/* This is the main content area for your entire application. */}
        {children}

        {/*
          You could put a global site-wide footer here.

          Example:
          <GlobalSiteFooter />
        */}
        </body>
        </html>
    );
}
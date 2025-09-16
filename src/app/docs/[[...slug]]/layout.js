import { getNavigationTree } from '@/lib/docs';
import Navigation from '@/components/Navigation'; // Your interactive client component for the sidebar
import Link from 'next/link'; // For the header logo/link

// ================================================================
// THE DOCS LAYOUT: src/app/docs/[[...slug]]/layout.js
// ================================================================
// This component wraps ONLY the pages inside the /docs route.
// It is rendered inside the RootLayout's {children}.
// ================================================================

// This layout is a Server Component, so it can be async to fetch data.
export default async function DocsLayout({ children }) {
    // 1. FETCH THE NAVIGATION TREE ON THE SERVER
    // This happens once at build time for static pages or on request for dynamic ones.
    // The data is then passed down to the client component.
    const navTree = getNavigationTree();

    return (
        <div className="docs-container">
            {/*
        This is a simple header specific to your documentation section.
        You can customize it or remove it entirely.
      */}
            <header className="docs-header">
                <Link href="/" className="logo-link">
                    {/* You can place your logo SVG or an <img> tag here */}
                    <span>Aryorithm Docs</span>
                </Link>
                <div className="header-nav-links">
                    <Link href="/docs">Documentation</Link>
                    <Link href="/blog">Blog</Link>
                    <Link href="/login" className="header-login-button">Sign In</Link>
                </div>
            </header>

            <div className="docs-body">
                {/* THE DYNAMIC SIDEBAR */}
                <aside className="doc-sidebar">
                    {/*
            2. RENDER THE NAVIGATION COMPONENT
            We pass the `navTree` data, which was fetched on the server,
            as a prop to our interactive <Navigation> client component.
            This is the recommended pattern for mixing server and client components.
          */}
                    <Navigation navTree={navTree} />
                </aside>

                {/*
          THE MAIN CONTENT AREA
          This is where the {children} - your `page.js` template - will be rendered.
        */}
                <main className="doc-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

// ================================================================
// RECOMMENDED CSS FOR THIS LAYOUT
// ================================================================
// Add this to your `src/app/globals.css` file to style the layout.
/*

*/
import { getNavigationTree } from '@/lib/docs';
import Navigation from '@/components/Navigation'; // Your client component from the previous step
import Link from 'next/link'; // Import Link for the header

// This is an async Server Component, which is the modern Next.js way.
export default async function DocsLayout({ children }) {
    // 1. Fetch the navigation tree on the server.
    // This happens once at build time for static pages, or on request for dynamic ones.
    const navTree = getNavigationTree();

    return (
        <div className="doc-page-container">
            {/* Example static header for the docs section */}
            <header className="docs-header">
                <Link href="/">My Logo</Link>
                <nav>
                    <Link href="/docs">Docs</Link>
                    <Link href="/blog">Blog</Link>
                </nav>
            </header>

            <div className="docs-body">
                {/* The sidebar that will contain our dynamic navigation */}
                <aside className="doc-sidebar">
                    {/* 2. Pass the server-fetched `navTree` data as a prop
                 to the interactive `Navigation` client component. */}
                    <Navigation navTree={navTree} />
                </aside>

                {/* The main content area where your page.js will be rendered */}
                <main className="doc-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

// NOTE: You will need to add some basic CSS to `globals.css`
// to make this layout look good. For example:
/*
.doc-page-container { ... }
.docs-header { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee; }
.docs-body { display: flex; }
.doc-sidebar { width: 280px; padding: 1.5rem; border-right: 1px solid #eee; }
.doc-content { flex: 1; padding: 1.5rem; }
*/
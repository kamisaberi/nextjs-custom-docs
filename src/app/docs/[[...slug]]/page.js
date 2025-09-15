import { getDocData, getAllDocSlugs } from '@/lib/docs';
import { notFound } from 'next/navigation';

// This function tells Next.js which pages to build ahead of time
export async function generateStaticParams() {
    return getAllDocSlugs();
}

// This function sets the page's metadata (e.g., in the browser tab)
export async function generateMetadata({ params }) {
    // The slug for the homepage will be empty, so we default it
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);
    return {
        title: docData?.title || 'Docs',
    };
}

// ================================================================
// THIS IS YOUR MAIN TEMPLATE COMPONENT
// ================================================================
export default async function DocPageTemplate({ params }) {
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);

    // If the page for the given URL isn't found, show a 404 page.
    if (!docData) {
        notFound();
    }

    return (
        // You can add any wrapper divs or components you want here.
        // This example uses a simple two-column layout.
        <div className="doc-page-container">

            {/* Example Sidebar */}
            <aside className="doc-sidebar">
                <h3>Navigation</h3>
                {/* In a real app, you'd dynamically generate this */}
                <ul>
                    <li><a href="/docs">Home</a></li>
                    <li><a href="/docs/topic-one">Topic One</a></li>
                </ul>
            </aside>

            {/* Main Content Area */}
            <main className="doc-content">
                <div className="prose lg:prose-xl">
                    {/* 1. RENDER THE TITLE FROM YOUR MARKDOWN FRONTMATTER */}
                    <h1>{docData.title}</h1>

                    {/* 2. RENDER THE CONVERTED MARKDOWN CONTENT */}
                    {/* `dangerouslySetInnerHTML` is safe here because `remark` sanitizes the HTML */}
                    <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
                </div>
            </main>

        </div>
    );
}
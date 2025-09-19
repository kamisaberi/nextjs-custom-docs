import { getDocData, getAllDocSlugs } from '@/lib/docs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TableOfContents from "@/components/TableOfContents";

export async function generateStaticParams() {
    const allSlugs = getAllDocSlugs();
    if (!allSlugs) return []; // Safety check
    return allSlugs.map(item => ({
        slug: item.params.slug
    }));
}

export async function generateMetadata({ params }) {
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);
    if (!docData) return { title: 'Not Found' };
    return {
        title: docData.title || 'Docs',
        description: docData.description || 'Documentation page',
    };
}

// ================================================================
// THE UPDATED PAGE TEMPLATE
// ================================================================
export default async function DocPageTemplate({ params }) {
    const slug = params.slug || ['index'];

    // Fetch the data for the page. `docData` will now contain the `headings` array.
    const docData = await getDocData(slug);

    if (!docData) {
        notFound();
    }

    return (
        // This new wrapper div creates the container for our content and TOC sidebar
        <div className="doc-page-with-toc">

            {/* The main article content, styled with Tailwind's `prose` class */}
            <article className="prose dark:prose-invert max-w-none">
                <h1>{docData.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
            </article>

            {/*
        The Table of Contents sidebar. It is only rendered if the
        `headings` array is not empty.
      */}
            {docData.headings.length > 0 && (
                <aside className="toc-container">
                    {/* We pass the `headings` array as a prop to our client component */}
                    <TableOfContents headings={docData.headings} />
                </aside>
            )}

        </div>
    );
}
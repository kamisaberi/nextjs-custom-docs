import { getDocData, getAllDocSlugs } from '@/lib/docs';
import { notFound } from 'next/navigation';
import Link from 'next/link'; // For potential breadcrumbs or other links

// This function tells Next.js which pages to pre-build during `npm run build`.
// It's essential for static site generation (SSG).
export async function generateStaticParams() {
    const allSlugs = getAllDocSlugs();
    // The structure needs to match the function signature, e.g., [{ slug: ['sub-folder', 'page-name'] }]
    return allSlugs.map(item => ({
        slug: item.params.slug
    }));
}

// This async function generates the metadata for the <head> of the page.
// It's great for SEO.
export async function generateMetadata({ params }) {
    // If the URL is `/docs`, the slug will be undefined. We default to the 'index' page.
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);

    // If no document is found, return a default title.
    if (!docData) {
        return {
            title: 'Document Not Found'
        };
    }

    // Use the title from the Markdown frontmatter for the page title.
    return {
        title: docData.title || 'Docs',
        description: docData.description || 'Documentation page', // You can add description to your frontmatter
    };
}


// ================================================================
// THIS IS YOUR MAIN DOCUMENTATION PAGE TEMPLATE
// ================================================================
export default async function DocPageTemplate({ params }) {
    // For the root docs page ('/docs'), params.slug will be undefined.
    // We handle this by defaulting to the 'index' file.
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);

    // If our library function returns null (because the file doesn't exist),
    // we trigger Next.js's built-in 404 page.
    if (!docData) {
        notFound();
    }

    // --- Render the Page ---
    return (
        // The `prose` classes from the Tailwind Typography plugin will style your HTML.
        // `max-w-none` removes the max-width constraint for wider content areas.
        <article className="prose dark:prose-invert lg:prose-xl max-w-none">

            {/*
        You can add extra UI elements like breadcrumbs here.
        This is a simple example.
      */}
            <div className="breadcrumbs" style={{ marginBottom: '2rem', fontSize: '0.9em', color: '#888' }}>
                <Link href="/docs">Docs</Link>
                {slug.map((segment, index) => (
                    <span key={index}>
            {' / '}
                        <Link href={`/docs/${slug.slice(0, index + 1).join('/')}`}>
              {segment.replace(/-/g, ' ')}
            </Link>
          </span>
                ))}
            </div>

            {/* Render the title from your Markdown file's frontmatter */}
            <h1>{docData.title}</h1>

            {/*
        Render the HTML content that was processed by our library.
        This includes the syntax-highlighted code blocks.
        `dangerouslySetInnerHTML` is the standard and safe way to render HTML
        that you have processed and sanitized on the server.
      */}
            <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />

        </article>
    );
}
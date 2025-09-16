import { getDocData, getAllDocSlugs } from '@/lib/docs';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

export default async function DocPageTemplate({ params }) {
    const slug = params.slug || ['index'];
    const docData = await getDocData(slug);
    if (!docData) {
        notFound();
    }
    return (
        <article className="prose dark:prose-invert max-w-none">
            <div className="breadcrumbs" style={{ marginBottom: '2rem', fontSize: '0.9em', color: '#888' }}>
                <Link href="/docs">Docs</Link>
                {slug.filter(s => s !== 'index').map((segment, index) => (
                    <span key={index}>
            {' / '}
                        <Link href={`/docs/${slug.slice(0, index + 1).join('/')}`}>
              {segment.replace(/-/g, ' ')}
            </Link>
          </span>
                ))}
            </div>
            <h1>{docData.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
        </article>
    );
}
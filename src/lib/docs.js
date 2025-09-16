import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const docsDirectory = path.join(process.cwd(), 'content/docs');

function formatTitle(name) {
    const title = name.replace(/-/g, ' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
}

function getMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getMarkdownFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(path.relative(docsDirectory, fullPath));
        }
    }
    return files;
}

export function getAllDocSlugs() {
    try {
        const allFiles = getMarkdownFiles(docsDirectory);
        if (!allFiles) {
            return [];
        }
        return allFiles.map((filePath) => {
            const slug = filePath.replace(/\.md$/, '').split(path.sep);
            return { params: { slug } };
        });
    } catch (error) {
        console.error("CRITICAL ERROR in getAllDocSlugs:", error);
        return [];
    }
}

export async function getDocData(slug) {
    const fullPath = path.join(docsDirectory, `${slug.join('/')}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    const processedContent = await remark()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: 'append' })
        .use(rehypePrettyCode, { theme: 'github-dark' })
        .use(rehypeStringify)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();
    return {
        slug,
        contentHtml,
        ...matterResult.data,
    };
}

function generateNavTree(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const navTree = [];
    const files = entries.filter(e => e.isFile() && e.name.endsWith('.md'));
    files.sort((a, b) => (a.name === 'index.md' ? -1 : b.name === 'index.md' ? 1 : a.name.localeCompare(b.name)));
    for (const entry of files) {
        const fullPath = path.join(dir, entry.name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        let slug = path.relative(docsDirectory, fullPath).replace(/\.md$/, '').replace(/\\/g, '/');
        if (slug === 'index') slug = '';
        navTree.push({
            type: 'file',
            name: data.title || formatTitle(path.basename(slug)),
            path: `/docs/${slug}`,
        });
    }
    const directories = entries.filter(e => e.isDirectory());
    directories.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of directories) {
        const fullPath = path.join(dir, entry.name);
        navTree.push({
            type: 'directory',
            name: formatTitle(entry.name),
            children: generateNavTree(fullPath),
        });
    }
    return navTree;
}

export function getNavigationTree() {
    return generateNavTree(docsDirectory);
}
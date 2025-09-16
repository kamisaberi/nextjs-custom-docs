import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';

// Get the absolute path to the 'content/docs' directory
const docsDirectory = path.join(process.cwd(), 'content/docs');

/**
 * Capitalizes the first letter and replaces hyphens with spaces.
 * e.g., 'getting-started' becomes 'Getting started'
 * @param {string} name - The file or directory name.
 * @returns {string} The formatted title.
 */
function formatTitle(name) {
    const title = name.replace(/-/g, ' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Reads a directory recursively to find all .md files.
 * @param {string} dir - The directory to scan.
 * @returns {string[]} An array of file paths relative to the `docs` directory.
 */
function getMarkdownFiles(dir) {
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

/**
 * Gets the URL slugs for all documentation pages. This is used by Next.js
 * to know which static pages to generate at build time.
 * e.g., 'sub-folder/another-page.md' becomes a params object: { slug: ['sub-folder', 'another-page'] }
 */
export function getAllDocSlugs() {
    const allFiles = getMarkdownFiles(docsDirectory);

    return allFiles.map((filePath) => {
        const slug = filePath.replace(/\.md$/, '').split(path.sep);
        return { params: { slug } };
    });
}

/**
 * Gets the parsed content and metadata for a single document.
 * This function includes the syntax highlighting logic.
 * @param {string[]} slug - An array of path segments from the URL.
 * @returns {object | null} The document data or null if not found.
 */
export async function getDocData(slug) {
    const fullPath = path.join(docsDirectory, `${slug.join('/')}.md`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Use remark and rehype to process the markdown with rehype-pretty-code
    const processedContent = await remark()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypePrettyCode, {
            // Use a VS Code theme for syntax highlighting
            // Find more themes here: https://github.com/shikijs/shiki/blob/main/docs/themes.md
            theme: 'github-dark',

            // Keep the background color of the code block.
            keepBackground: true,

            // Custom callbacks for highlighting features
            onVisitLine(node) {
                if (node.children.length === 0) {
                    node.children = [{ type: 'text', value: ' ' }];
                }
            },
            onVisitHighlightedLine(node) {
                node.properties.className.push('highlighted');
            },
            onVisitHighlightedWord(node) {
                node.properties.className = ['word--highlighted'];
            },
        })
        .use(rehypeStringify)
        .process(matterResult.content);

    const contentHtml = processedContent.toString();

    return {
        slug,
        contentHtml,
        ...matterResult.data, // This is your frontmatter (e.g., title, description)
    };
}

/**
 * Recursively scans a directory and builds a nested navigation tree.
 * This is the engine for our dynamic sidebar.
 * @param {string} dir - The full path of the directory to scan.
 * @returns {object[]} An array of navigation link objects.
 */
function generateNavTree(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const navTree = [];

    // First, process all the files, sorting 'index.md' to the top.
    const files = entries.filter(e => e.isFile() && e.name.endsWith('.md'));
    files.sort((a, b) => (a.name === 'index.md' ? -1 : b.name === 'index.md' ? 1 : a.name.localeCompare(b.name)));

    for (const entry of files) {
        const fullPath = path.join(dir, entry.name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        let slug = path.relative(docsDirectory, fullPath)
            .replace(/\.md$/, '')
            .replace(/\\/g, '/'); // Ensure forward slashes for URLs

        // Handle the root index file to link to '/docs' instead of '/docs/index'
        if (slug === 'index') {
            slug = '';
        }

        navTree.push({
            type: 'file',
            name: data.title || formatTitle(path.basename(slug)), // Use frontmatter title if available
            path: `/docs/${slug}`,
        });
    }

    // Then, process all the subdirectories
    const directories = entries.filter(e => e.isDirectory());
    directories.sort((a,b) => a.name.localeCompare(b.name)); // Sort directories alphabetically

    for (const entry of directories) {
        const fullPath = path.join(dir, entry.name);
        navTree.push({
            type: 'directory',
            name: formatTitle(entry.name),
            children: generateNavTree(fullPath), // Recursive call
        });
    }

    return navTree;
}

/**
 * The main function to be called from components.
 * It starts the recursive scan from the root docs directory.
 */
export function getNavigationTree() {
    return generateNavTree(docsDirectory);
}
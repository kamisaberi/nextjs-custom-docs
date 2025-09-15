import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Get the absolute path to the 'content/docs' directory
const docsDirectory = path.join(process.cwd(), 'content/docs');

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
            // Return the path relative to the base 'docs' directory
            files.push(path.relative(docsDirectory, fullPath));
        }
    }
    return files;
}

/**
 * Gets the URL slugs for all documentation pages.
 * e.g., 'sub-folder/another-page.md' becomes ['sub-folder', 'another-page']
 */
export function getAllDocSlugs() {
    const allFiles = getMarkdownFiles(docsDirectory);

    return allFiles.map((filePath) => {
        // Remove the .md extension and split by the OS-specific separator
        const slug = filePath.replace(/\.md$/, '').split(path.sep);
        return { params: { slug } };
    });
}

/**
 * Gets the parsed content and metadata for a single document.
 * @param {string[]} slug - An array of path segments from the URL.
 */
export async function getDocData(slug) {
    const fullPath = path.join(docsDirectory, `${slug.join('/')}.md`);

    if (!fs.existsSync(fullPath)) {
        return null; // Handle case where file doesn't exist
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the frontmatter (metadata)
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into an HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // Return all the data
    return {
        slug,
        contentHtml,
        ...matterResult.data, // This is your frontmatter (e.g., title, description)
    };
}
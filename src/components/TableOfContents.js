'use client';

import { useState, useEffect, useRef } from 'react';

function TableOfContents({ headings }) {
    const [activeId, setActiveId] = useState('');
    const observer = useRef(null);

    useEffect(() => {
        // This function is called when a heading enters or leaves the viewport
        const handleObserver = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        };

        // Create the Intersection Observer
        observer.current = new IntersectionObserver(handleObserver, {
            rootMargin: "-20% 0% -80% 0px", // Triggers when heading is in the top 20% of the viewport
        });

        // Observe all the heading elements found on the page
        const elements = headings.map(heading => document.getElementById(heading.id)).filter(el => el);
        elements.forEach((el) => observer.current.observe(el));

        // Cleanup function to disconnect the observer
        return () => observer.current?.disconnect();
    }, [headings]);

    return (
        <nav className="toc-sidebar">
            <h4 className="toc-title">On this page</h4>
            <ul>
                {headings.map((heading) => (
                    <li key={heading.id} className={`toc-item toc-${heading.level}`}>
                        <a
                            href={`#${heading.id}`}
                            className={`toc-link ${activeId === heading.id ? 'active' : ''}`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default TableOfContents;
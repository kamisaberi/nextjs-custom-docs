'use client';

import { useState, useEffect, useRef } from 'react';

function TableOfContents({ headings }) {
    const [activeId, setActiveId] = useState('');
    const observer = useRef(null);

    // This effect sets up the IntersectionObserver to watch the headings
    useEffect(() => {
        // Cleanup previous observer before creating a new one
        if (observer.current) {
            observer.current.disconnect();
        }

        // This function is called when a heading enters or leaves the viewport
        const handleObserver = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // When a heading is in view, set it as the active ID
                    setActiveId(entry.target.id);
                }
            });
        };

        // Create the observer. The rootMargin is configured to trigger when a
        // heading is near the top of the screen.
        observer.current = new IntersectionObserver(handleObserver, {
            rootMargin: "-20% 0% -75% 0px",
        });

        // Find all the heading elements on the page that match our extracted headings
        const elements = headings
            .map(heading => document.getElementById(heading.id))
            .filter(el => el); // Filter out any nulls if an ID isn't found

        // Start observing each heading element
        elements.forEach((el) => observer.current.observe(el));

        // Cleanup function to disconnect the observer when the component unmounts
        return () => observer.current?.disconnect();
    }, [headings]); // Rerun the effect if the headings change (e.g., on page navigation)

    if (headings.length === 0) {
        return null; // Don't render anything if there are no headings
    }

    return (
        <nav className="toc-sidebar">
            <h4 className="toc-title">On this page</h4>
            <ul>
                {headings.map((heading) => (
                    <li key={heading.id} className={`toc-item toc-${heading.level}`}>
                        <a
                            href={`#${heading.id}`}
                            // The `active` class is applied conditionally
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
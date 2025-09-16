'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// This is the recursive component that renders the navigation tree.
function NavLinks({ items }) {
    const pathname = usePathname(); // Get the current URL path

    return (
        <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
            {items.map((item) => {
                if (item.type === 'directory') {
                    // For directories, render a collapsible section
                    return (
                        <li key={item.name}>
                            <CollapsibleNavItem name={item.name} childrenItems={item.children} />
                        </li>
                    );
                }

                // For files, render a link
                const isActive = pathname === item.path;
                return (
                    <li key={item.path}>
                        <Link
                            href={item.path}
                            style={{
                                color: isActive ? '#0070f3' : 'inherit',
                                fontWeight: isActive ? 'bold' : 'normal'
                            }}
                        >
                            {item.name}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

// A helper component to manage the collapsible state of directories
function CollapsibleNavItem({ name, childrenItems }) {
    const [isOpen, setIsOpen] = useState(true); // Default to open

    return (
        <div>
            <strong onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {isOpen ? '▼' : '►'} {name}
            </strong>
            {isOpen && <NavLinks items={childrenItems} />}
        </div>
    );
}

// The main component that receives the navigation tree
export default function Navigation({ navTree }) {
    return (
        <nav>
            <NavLinks items={navTree} />
        </nav>
    );
}
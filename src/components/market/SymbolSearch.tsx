
// src/components/market/SymbolSearch.tsx
'use client';

import React, { useState } from 'react';

export const SymbolSearch: React.FC = () => {
    const [query, setQuery] = useState('');

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search symbols..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

export default SymbolSearch;

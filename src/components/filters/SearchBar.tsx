'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/utils/seDebounce';


interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    delay?: number;
    className?: string;
    autoFocus?: boolean;
    icon?: React.ReactNode; // <--- أضفنا هنا
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search symbols...',
    onSearch,
    delay = 300,
    className = '',
    autoFocus = false,
    icon
}) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce((searchQuery: string) => {
        onSearch(searchQuery);
    }, delay);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    const handleClear = useCallback(() => {
        setQuery('');
        onSearch('');
        inputRef.current?.focus();
    }, [onSearch]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }, [query, onSearch]);

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </form>
    );
};
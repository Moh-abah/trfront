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
    icon?: React.ReactNode;
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </form>
    );
};
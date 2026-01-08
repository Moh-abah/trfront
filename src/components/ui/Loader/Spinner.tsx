import React from 'react';
import { Loader } from './Loader';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = (props) => {
    return <Loader {...props} />;
};
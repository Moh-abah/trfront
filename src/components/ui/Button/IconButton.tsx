'use client';
import React from 'react';
import { Button, ButtonProps } from './Button';

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
    icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, ...props }) => {
    return (
        <Button
            {...props}
            className={`p-2 ${props.className || ''}`}
        >
            {icon}
        </Button>
    );
};
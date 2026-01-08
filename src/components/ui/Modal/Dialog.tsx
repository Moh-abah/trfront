'use client';
import React from 'react';
import { Modal, ModalProps } from './Modal';
import { Button } from '../Button/Button';

interface DialogProps extends Omit<ModalProps, 'children'> {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export const Dialog: React.FC<DialogProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'info',
    ...modalProps
}) => {
    const variantColors = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        info: 'bg-blue-500 hover:bg-blue-600',
    };

    return (
        <Modal {...modalProps} onClose={onCancel} title={title}>
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        className={variantColors[variant]}
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
import React, { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    title?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent background scrolling when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="p-modal-backdrop" onClick={onClose}>
            <div 
                className={`p-modal p-modal-${size}`} 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="p-modal-header">
                        <h2 className="p-modal-title">{title}</h2>
                        <button 
                            className="p-modal-close" 
                            onClick={onClose}
                            title="Đóng"
                        >
                            <MdClose />
                        </button>
                    </div>
                )}
                <div className="p-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;

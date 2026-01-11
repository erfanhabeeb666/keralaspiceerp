import React, { useEffect, useRef } from 'react';
import { HiXMark } from 'react-icons/hi2';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md', // sm, md, lg
    icon = null,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus the modal for accessibility
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: { maxWidth: 400 },
        md: { maxWidth: 520 },
        lg: { maxWidth: 720 },
        xl: { maxWidth: 900 },
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--space-6)',
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="modal"
                style={{
                    ...sizeStyles[size],
                    background: 'white',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25)',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    outline: 'none',
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div
                    className="modal-header"
                    style={{
                        padding: 'var(--space-6) var(--space-7)',
                        borderBottom: '1px solid var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(180deg, var(--gray-50) 0%, white 100%)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {icon && (
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--primary-50)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-600)',
                            }}>
                                {icon}
                            </div>
                        )}
                        <h2
                            id="modal-title"
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--gray-900)',
                                letterSpacing: '-0.02em',
                                margin: 0,
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--gray-400)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--gray-100)';
                            e.currentTarget.style.color = 'var(--gray-700)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--gray-400)';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                        aria-label="Close modal"
                    >
                        <HiXMark size={20} />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="modal-body"
                    style={{
                        padding: 'var(--space-7)',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                    }}
                >
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div
                        className="modal-footer"
                        style={{
                            padding: 'var(--space-5) var(--space-7)',
                            borderTop: '1px solid var(--gray-100)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--space-3)',
                            background: 'var(--gray-50)',
                        }}
                    >
                        {footer}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(24px) scale(0.96);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default Modal;

import React, { useState } from 'react';
import { HiExclamationCircle } from 'react-icons/hi2';

const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    placeholder,
    disabled = false,
    options = [], // For select type
    rows = 4, // For textarea type
    min,
    max,
    className = '',
    helperText,
    icon,
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const hasError = touched && error;

    const baseInputStyles = {
        width: '100%',
        padding: icon ? 'var(--space-3) var(--space-4) var(--space-3) var(--space-11)' : 'var(--space-3) var(--space-4)',
        fontSize: '0.9375rem',
        color: 'var(--gray-800)',
        background: disabled ? 'var(--gray-50)' : 'white',
        border: `1.5px solid ${hasError ? 'var(--error-400)' : focused ? 'var(--primary-400)' : 'var(--gray-200)'}`,
        borderRadius: 'var(--radius-xl)',
        transition: 'all 0.2s ease',
        boxShadow: hasError
            ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
            : focused
                ? '0 0 0 3px rgba(99, 102, 241, 0.1)'
                : 'var(--shadow-xs)',
        outline: 'none',
    };

    const handleFocus = (e) => {
        setFocused(true);
        props.onFocus && props.onFocus(e);
    };

    const handleBlur = (e) => {
        setFocused(false);
        onBlur && onBlur(e);
    };

    const renderInput = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        style={{
                            ...baseInputStyles,
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right var(--space-3) center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: 'var(--space-10)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                        {...props}
                    >
                        <option value="">{placeholder || 'Select an option'}</option>
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder={placeholder}
                        rows={rows}
                        style={{
                            ...baseInputStyles,
                            minHeight: 100,
                            resize: 'vertical',
                            lineHeight: 1.6,
                        }}
                        {...props}
                    />
                );

            case 'date':
                return (
                    <input
                        id={name}
                        name={name}
                        type="date"
                        value={value || ''}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        min={min}
                        max={max}
                        style={{
                            ...baseInputStyles,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                        {...props}
                    />
                );

            default:
                return (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value || ''}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        style={baseInputStyles}
                        {...props}
                    />
                );
        }
    };

    return (
        <div className={`form-group ${className}`} style={{ marginBottom: 'var(--space-5)' }}>
            {label && (
                <label
                    htmlFor={name}
                    style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: focused ? 'var(--primary-600)' : hasError ? 'var(--error-600)' : 'var(--gray-700)',
                        marginBottom: 'var(--space-2)',
                        transition: 'color 0.15s ease',
                        letterSpacing: '-0.01em',
                    }}
                >
                    {label}
                    {required && (
                        <span style={{ color: 'var(--error-500)', marginLeft: 'var(--space-1)' }}>*</span>
                    )}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                {icon && (
                    <div style={{
                        position: 'absolute',
                        left: 'var(--space-4)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: focused ? 'var(--primary-500)' : 'var(--gray-400)',
                        transition: 'color 0.15s ease',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {icon}
                    </div>
                )}
                {renderInput()}
            </div>

            {hasError && (
                <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--error-600)',
                    marginTop: 'var(--space-1-5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                }}>
                    <HiExclamationCircle size={14} />
                    {error}
                </p>
            )}

            {helperText && !hasError && (
                <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--gray-500)',
                    marginTop: 'var(--space-1-5)',
                }}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default FormInput;

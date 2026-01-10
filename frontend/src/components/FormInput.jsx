import React from 'react';

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
    ...props
}) => {
    const hasError = touched && error;
    const inputClass = `form-input ${hasError ? 'error' : ''} ${className}`;

    const renderInput = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        id={name}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={`${inputClass} form-select`}
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
                        onBlur={onBlur}
                        disabled={disabled}
                        placeholder={placeholder}
                        rows={rows}
                        className={`${inputClass} form-textarea`}
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
                        onBlur={onBlur}
                        disabled={disabled}
                        min={min}
                        max={max}
                        className={inputClass}
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
                        onBlur={onBlur}
                        disabled={disabled}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        className={inputClass}
                        {...props}
                    />
                );
        }
    };

    return (
        <div className="form-group">
            {label && (
                <label
                    htmlFor={name}
                    className={`form-label ${required ? 'required' : ''}`}
                >
                    {label}
                </label>
            )}
            {renderInput()}
            {hasError && (
                <p className="form-error">{error}</p>
            )}
        </div>
    );
};

export default FormInput;

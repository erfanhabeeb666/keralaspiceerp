import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data with loading and error states
 */
export const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { immediate = true, dependencies = [] } = options;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(url);
            setData(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (immediate && url) {
            fetchData();
        }
    }, [immediate, fetchData, ...dependencies]);

    const refetch = () => fetchData();

    return { data, loading, error, refetch };
};

/**
 * Custom hook for handling form state
 */
export const useForm = (initialState = {}, validate = () => ({})) => {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        // Validate on blur
        const validationErrors = validate(values);
        setErrors(validationErrors);
    };

    const setFieldValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = (newValues = initialState) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
    };

    const validateForm = () => {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        setIsSubmitting,
        handleChange,
        handleBlur,
        setFieldValue,
        resetForm,
        validateForm,
        setValues,
        setErrors,
    };
};

export default useFetch;

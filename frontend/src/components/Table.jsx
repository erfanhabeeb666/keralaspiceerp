import React from 'react';
import { HiChevronLeft, HiChevronRight, HiOutlineInbox } from 'react-icons/hi2';

const Table = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    pagination = null,
    onPageChange = null,
}) => {
    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner spinner-lg" />
                <span style={{ color: 'var(--gray-500)' }}>Loading...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="empty-state">
                <HiOutlineInbox className="empty-state-icon" />
                <h3 className="empty-state-title">{emptyMessage}</h3>
                <p className="empty-state-text">There are no records to display at this time.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((column, idx) => (
                                <th
                                    key={idx}
                                    style={{
                                        width: column.width,
                                        textAlign: column.align || 'left',
                                    }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr key={row.id || rowIdx}>
                                {columns.map((column, colIdx) => (
                                    <td
                                        key={colIdx}
                                        style={{ textAlign: column.align || 'left' }}
                                    >
                                        {column.render ? column.render(row) : row[column.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                    >
                        <HiChevronLeft size={18} />
                    </button>

                    {[...Array(pagination.totalPages)].map((_, idx) => {
                        const page = idx + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.currentPage) <= 1
                        ) {
                            return (
                                <button
                                    key={page}
                                    className={`pagination-btn ${pagination.currentPage === page ? 'active' : ''}`}
                                    onClick={() => onPageChange && onPageChange(page)}
                                >
                                    {page}
                                </button>
                            );
                        }
                        // Show ellipsis
                        if (Math.abs(page - pagination.currentPage) === 2) {
                            return <span key={page} style={{ padding: '0 0.5rem', color: 'var(--gray-400)' }}>...</span>;
                        }
                        return null;
                    })}

                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                    >
                        <HiChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;

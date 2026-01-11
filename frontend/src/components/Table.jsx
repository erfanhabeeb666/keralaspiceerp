import React from 'react';
import { HiChevronLeft, HiChevronRight, HiOutlineInbox, HiOutlineMagnifyingGlassCircle } from 'react-icons/hi2';

const Table = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    emptySubMessage = 'There are no records to display at this time.',
    pagination = null,
    onPageChange = null,
}) => {
    if (loading) {
        return (
            <div className="loading-overlay" style={{ minHeight: 300 }}>
                <div
                    className="spinner spinner-lg"
                    style={{
                        borderColor: 'var(--gray-200)',
                        borderTopColor: 'var(--primary-500)',
                    }}
                />
                <span className="loading-text">Loading data...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="empty-state" style={{ minHeight: 300, padding: 'var(--space-12) var(--space-6)' }}>
                <div className="empty-state-icon">
                    <HiOutlineMagnifyingGlassCircle size={40} />
                </div>
                <h3 className="empty-state-title">{emptyMessage}</h3>
                <p className="empty-state-text">{emptySubMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <div
                className="table-container"
                style={{
                    borderRadius: 0,
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderTop: 'none',
                }}
            >
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((column, idx) => (
                                <th
                                    key={idx}
                                    style={{
                                        width: column.width,
                                        textAlign: column.align || 'left',
                                        background: 'linear-gradient(180deg, var(--gray-50) 0%, var(--gray-100) 100%)',
                                    }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr
                                key={row.id || rowIdx}
                                style={{
                                    animation: `fadeIn 0.2s ease-out ${rowIdx * 0.03}s both`,
                                }}
                            >
                                {columns.map((column, colIdx) => (
                                    <td
                                        key={colIdx}
                                        style={{
                                            textAlign: column.align || 'left',
                                            transition: 'all 0.15s ease',
                                        }}
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
            {pagination && pagination.totalPages > 1 && (
                <div
                    style={{
                        padding: 'var(--space-5) var(--space-6)',
                        borderTop: '1px solid var(--gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--gray-50)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)',
                    }}
                >
                    {/* Page info */}
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Showing page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                    </div>

                    {/* Pagination controls */}
                    <div className="pagination" style={{ margin: 0 }}>
                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            style={{
                                width: 36,
                                height: 36,
                                transition: 'all 0.15s ease',
                            }}
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
                                        style={{
                                            width: 36,
                                            height: 36,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {page}
                                    </button>
                                );
                            }
                            // Show ellipsis
                            if (Math.abs(page - pagination.currentPage) === 2) {
                                return (
                                    <span
                                        key={page}
                                        style={{
                                            padding: '0 0.5rem',
                                            color: 'var(--gray-400)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        ···
                                    </span>
                                );
                            }
                            return null;
                        })}

                        <button
                            className="pagination-btn"
                            onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            style={{
                                width: 36,
                                height: 36,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <HiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;

import React from 'react';
import { Table as BTable, Pagination } from 'react-bootstrap';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const Table = ({
  columns,
  data,
  pagination,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
}) => {
  const handleSort = (column) => {
    if (!column.sortable) return;
    
    const newDirection = 
      sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort && onSort(column.key, newDirection);
  };

  const renderSortIcon = (column) => {
    if (!column.sortable) return null;
    
    if (sortColumn !== column.key) {
      return <FaSort className="ms-1 text-muted" size={12} />;
    }
    
    return sortDirection === 'asc' ? (
      <FaSortUp className="ms-1" size={12} />
    ) : (
      <FaSortDown className="ms-1" size={12} />
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, total, perPage } = pagination;
    const pages = [];

    // Page précédente
    pages.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Numéros de pages
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Pagination.Item>
        );
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        pages.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />);
      }
    }

    // Page suivante
    pages.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return (
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Affichage de {(currentPage - 1) * perPage + 1} à{' '}
          {Math.min(currentPage * perPage, total)} sur {total} résultats
        </div>
        <Pagination className="mb-0">{pages}</Pagination>
      </div>
    );
  };

  return (
    <>
      <BTable hover responsive className="mb-0">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                style={{
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                {column.label}
                {renderSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5 text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </BTable>

      {renderPagination()}
    </>
  );
};

export default Table;
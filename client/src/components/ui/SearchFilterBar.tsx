import { MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import './SearchFilterBar.css';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
  resultCount?: number;
  totalCount?: number;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  placeholder = 'Tìm kiếm...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onReset,
  resultCount,
  totalCount,
}: SearchFilterBarProps) {
  const hasActiveFilter =
    searchValue.trim() !== '' ||
    Object.values(filterValues).some((v) => v !== '');

  return (
    <div className="sfb-wrapper">
      <div className="sfb-controls">
        {/* Search input */}
        <div className="sfb-search">
          <MdSearch className="sfb-search-icon" size={18} />
          <input
            type="text"
            className="sfb-search-input"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              className="sfb-clear-btn"
              onClick={() => onSearchChange('')}
              title="Xóa tìm kiếm"
            >
              <MdClose size={16} />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {filters.length > 0 && (
          <div className="sfb-filters">
            <MdFilterList className="sfb-filter-icon" size={18} />
            {filters.map((f) => (
              <div key={f.key} className="sfb-filter-item">
                <select
                  className="sfb-select"
                  value={filterValues[f.key] ?? ''}
                  onChange={(e) => onFilterChange?.(f.key, e.target.value)}
                  title={f.label}
                >
                  <option value="">{f.placeholder ?? `-- ${f.label} --`}</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Reset button */}
        {hasActiveFilter && onReset && (
          <button className="sfb-reset-btn" onClick={onReset} title="Xóa bộ lọc">
            <MdClose size={15} />
            Đặt lại
          </button>
        )}
      </div>

      {/* Result count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <div className="sfb-result-count">
          {hasActiveFilter ? (
            <>
              Hiển thị <strong>{resultCount}</strong> / {totalCount} kết quả
            </>
          ) : (
            <>
              Tổng cộng <strong>{totalCount}</strong> bản ghi
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilterBar;

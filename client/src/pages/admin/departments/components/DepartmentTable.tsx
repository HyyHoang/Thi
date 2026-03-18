import React from 'react';
import { Department, Institute } from '../../../../types';

interface DepartmentTableProps {
    departments: Department[];
    institutes: Institute[];
    loading: boolean;
    canEdit: boolean;
    onView: (department: Department) => void;
    onEdit: (department: Department) => void;
    onDelete: (department: Department) => void;
}

function DepartmentTable({
    departments,
    institutes,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: DepartmentTableProps) {
    const instituteNameFor = (department: Department) => {
        if (department.institute_name) return department.institute_name;
        const found = institutes.find((i) => i.institute_id === department.institute_id);
        return found?.institute_name || '-';
    };

    return (
        <div className="department-table-wrapper">
            <table className="department-table">
                <thead>
                    <tr>
                        <th>DepartmentID</th>
                        <th>DepartmentName</th>
                        <th>InstituteName</th>
                        <th>Description</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={5} className="muted">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && departments.length === 0 && (
                        <tr>
                            <td colSpan={5} className="muted">
                                Chưa có khoa nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        departments.map((dep) => (
                            <tr key={dep.department_id}>
                                <td>{dep.department_id}</td>
                                <td>{dep.department_name}</td>
                                <td>{instituteNameFor(dep)}</td>
                                <td>{dep.description || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(dep)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(dep)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(dep)}
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default DepartmentTable;


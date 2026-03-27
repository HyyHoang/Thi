import React from 'react';
import { StudentProfile } from '../../../../types';

interface StudentProfileTableProps {
    profiles: StudentProfile[];
    loading: boolean;
    canEdit: boolean;
    onView: (profile: StudentProfile) => void;
    onEdit: (profile: StudentProfile) => void;
    onDelete: (profile: StudentProfile) => void;
}

function StudentProfileTable({
    profiles,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: StudentProfileTableProps) {
    const renderStatus = (status: number) => {
        if (status === 1) return <span className="badge badge-success">Đang học</span>;
        if (status === 2) return <span className="badge badge-warning">Bảo lưu</span>;
        if (status === 3) return <span className="badge badge-danger">Bỏ học</span>;
        return <span>-</span>;
    };

    return (
        <div className="table-wrapper">
            <table className="department-table">
                <thead>
                    <tr>
                        <th>Mã SV</th>
                        <th>Họ tên</th>
                        <th>Tên khoa</th>
                        <th>Năm nhập học</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={6} className="muted">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && profiles.length === 0 && (
                        <tr>
                            <td colSpan={6} className="muted">
                                Chưa có hồ sơ sinh viên nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        profiles.map((p) => (
                            <tr key={p.StudentID}>
                                <td>{p.StudentID}</td>
                                <td>{p.FullName}</td>
                                <td>{p.department?.department_name || p.department?.DepartmentName || '-'}</td>
                                <td>{p.EnrollmentYear}</td>
                                <td>{renderStatus(p.Status)}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(p)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(p)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(p)}
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

export default StudentProfileTable;

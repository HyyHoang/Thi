import React from 'react';
import { Semester } from '../../../../types';

interface SemesterTableProps {
    semesters: Semester[];
    loading: boolean;
    canEdit: boolean;
    onView: (semester: Semester) => void;
    onEdit: (semester: Semester) => void;
    onDelete: (semester: Semester) => void;
}

function SemesterTable({
    semesters,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: SemesterTableProps) {
    return (
        <div className="semester-table-wrapper">
            <table className="semester-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên học kỳ</th>
                        <th>Năm học</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
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
                    {!loading && semesters.length === 0 && (
                        <tr>
                            <td colSpan={6} className="muted">
                                Chưa có học kỳ nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        semesters.map((semester) => (
                            <tr key={semester.semester_id}>
                                <td>{semester.semester_id}</td>
                                <td>{semester.semester_name}</td>
                                <td>{semester.academic_year}</td>
                                <td>{semester.start_date}</td>
                                <td>{semester.end_date}</td>
                                <td>
                                    <div className="action-group">
                                        <button type="button" className="ghost-btn" onClick={() => onView(semester)}>
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button type="button" className="ghost-btn" onClick={() => onEdit(semester)}>
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(semester)}
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

export default SemesterTable;

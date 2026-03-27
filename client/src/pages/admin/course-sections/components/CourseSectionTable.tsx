import React from 'react';
import { CourseSection } from '../../../../types';

interface CourseSectionTableProps {
    courseSections: CourseSection[];
    loading: boolean;
    canEdit: boolean;
    onView: (section: CourseSection) => void;
    onEdit: (section: CourseSection) => void;
    onDelete: (section: CourseSection) => void;
}

function CourseSectionTable({
    courseSections,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: CourseSectionTableProps) {
    return (
        <div className="course-section-table-wrapper">
            <table className="course-section-table">
                <thead>
                    <tr>
                        <th>ID Lớp</th>
                        <th>Tên Lớp (Mã HP)</th>
                        <th>Môn học</th>
                        <th>Học kỳ</th>
                        <th>Giảng viên</th>
                        <th>Sĩ số</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={8} className="muted">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && courseSections.length === 0 && (
                        <tr>
                            <td colSpan={8} className="muted">
                                Chưa có lớp học phần nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        courseSections.map((sec) => (
                            <tr key={sec.SectionID}>
                                <td>{sec.SectionID}</td>
                                <td>{sec.SectionName}</td>
                                <td>{sec.Subject?.SubjectName || sec.SubjectID}</td>
                                <td>{sec.Semester?.SemesterName || sec.SemesterID}</td>
                                <td>{sec.Teacher?.FullName || sec.TeacherID}</td>
                                <td>{sec.MaxStudent}</td>
                                <td>{sec.CreatedDate ? new Date(sec.CreatedDate).toLocaleDateString('vi-VN') : '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(sec)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(sec)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(sec)}
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

export default CourseSectionTable;

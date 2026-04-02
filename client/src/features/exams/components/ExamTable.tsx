import React from 'react';
import { Exam } from '../../../types';

interface ExamTableProps {
    exams: Exam[];
    currentUserId: string;
    currentUserRole: number;
    onView: (exam: Exam) => void;
    onEdit: (exam: Exam) => void;
    onDelete: (exam: Exam) => void;
}

function formatDateTime(dt: string) {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

const ExamTable: React.FC<ExamTableProps> = ({
    exams, currentUserId, currentUserRole, onView, onEdit, onDelete
}) => {
    const canModify = (exam: Exam) =>
        currentUserRole === 0 || exam.created_by === currentUserId;

    return (
        <div className="crud-table-wrapper">
            <table className="crud-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tiêu đề</th>
                        <th>Môn học</th>
                        <th>Lớp học phần</th>
                        <th>Học kỳ</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Thời gian</th>
                        <th>Số câu</th>
                        <th>Mật khẩu</th>
                        <th>Người tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {exams.length === 0 ? (
                        <tr>
                            <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Chưa có đề thi nào.
                            </td>
                        </tr>
                    ) : (
                        exams.map((exam, idx) => (
                            <tr key={exam.exam_id}>
                                <td>{idx + 1}</td>
                                <td>
                                    <strong>{exam.title}</strong>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.exam_id}</div>
                                </td>
                                <td>{exam.subject_name || '—'}</td>
                                <td>{exam.section_name || exam.section_id}</td>
                                <td>{exam.semester_name || '—'}</td>
                                <td>{formatDateTime(exam.start_time)}</td>
                                <td>{formatDateTime(exam.end_time)}</td>
                                <td>{exam.duration} phút</td>
                                <td>
                                    <span className="badge badge-primary">{exam.question_count} câu</span>
                                </td>
                                <td>
                                    {exam.password_enabled
                                        ? <span className="badge badge-warning">Có</span>
                                        : <span className="badge badge-muted">Không</span>
                                    }
                                </td>
                                <td>{exam.creator_username || exam.created_by}</td>
                                <td>
                                    <div className="crud-action-btns">
                                        <button
                                            className="btn btn-sm btn-view"
                                            onClick={() => onView(exam)}
                                            title="Xem chi tiết"
                                        >
                                            Xem
                                        </button>
                                        {canModify(exam) && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-edit"
                                                    onClick={() => onEdit(exam)}
                                                    title="Chỉnh sửa"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-delete"
                                                    onClick={() => onDelete(exam)}
                                                    title="Xóa"
                                                >
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ExamTable;

import { Subject, Department } from '../../../../types';

interface SubjectTableProps {
    subjects: Subject[];
    departments: Department[];
    loading: boolean;
    canEdit: boolean;
    onView: (subject: Subject) => void;
    onEdit: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
}

function SubjectTable({
    subjects,
    departments,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: SubjectTableProps) {
    const departmentNameFor = (subject: Subject) => {
        if (subject.department && subject.department.department_name) return subject.department.department_name;
        const found = departments.find((d) => d.department_id === subject.DepartmentID);
        return found?.department_name || '-';
    };

    return (
        <div className="subject-table-wrapper">
            <table className="subject-table">
                <thead>
                    <tr>
                        <th>Mã MH</th>
                        <th>Tên môn học</th>
                        <th>Số TC</th>
                        <th>Tên khoa</th>
                        <th>Mô tả</th>
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
                    {!loading && subjects.length === 0 && (
                        <tr>
                            <td colSpan={6} className="muted">
                                Chưa có môn học nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        subjects.map((sub) => (
                            <tr key={sub.SubjectID}>
                                <td>{sub.SubjectID}</td>
                                <td>{sub.SubjectName}</td>
                                <td>{sub.Credit}</td>
                                <td>{departmentNameFor(sub)}</td>
                                <td>{sub.Description || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(sub)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(sub)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(sub)}
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

export default SubjectTable;

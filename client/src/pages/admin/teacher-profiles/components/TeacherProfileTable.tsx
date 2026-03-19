import { TeacherProfile } from '../../../../types';

interface TeacherProfileTableProps {
    profiles: TeacherProfile[];
    loading: boolean;
    canEdit: boolean;
    onView: (profile: TeacherProfile) => void;
    onEdit: (profile: TeacherProfile) => void;
    onDelete: (profile: TeacherProfile) => void;
}

function TeacherProfileTable({
    profiles,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: TeacherProfileTableProps) {
    return (
        <div className="teacher-profile-table-wrapper">
            <table className="teacher-profile-table">
                <thead>
                    <tr>
                        <th>Mã GV</th>
                        <th>Họ tên</th>
                        <th>Khoa</th>
                        <th>Email liên kết</th>
                        <th>Chức danh</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && profiles.length === 0 && (
                        <tr>
                            <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                                Chưa có hồ sơ giảng viên nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        profiles.map((profile) => (
                            <tr key={profile.teacher_id}>
                                <td>{profile.teacher_id}</td>
                                <td>{profile.full_name}</td>
                                <td>{profile.department?.department_name || '-'}</td>
                                <td>{profile.user?.email || '-'}</td>
                                <td>{profile.academic_rank || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(profile)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(profile)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(profile)}
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

export default TeacherProfileTable;

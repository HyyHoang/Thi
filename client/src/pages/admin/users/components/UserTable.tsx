import { User } from '../../../../types';

interface UserTableProps {
    users: User[];
    loading: boolean;
    canEdit: boolean;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

const ROLE_OPTIONS = [
    { value: 0, label: 'Admin' },
    { value: 1, label: 'Teacher' },
    { value: 2, label: 'Student' },
];

function UserTable({
    users,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: UserTableProps) {
    const roleLabel = (value: number) => {
        const option = ROLE_OPTIONS.find((r) => r.value === value);
        return option ? option.label : 'Unknown';
    };

    const formatDate = (value?: string) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className="user-table-wrapper">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>UserID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>AVT</th>
                        <th>Role</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={7} className="muted">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && users.length === 0 && (
                        <tr>
                            <td colSpan={7} className="muted">
                                Chưa có tài khoản nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        users.map((user) => (
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.avt || '-'}</td>
                                <td>{roleLabel(user.role)}</td>
                                <td>{formatDate(user.created_date)}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(user)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(user)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(user)}
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

export default UserTable;

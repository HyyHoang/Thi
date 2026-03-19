import { Institute } from '../../../../types';

interface InstituteTableProps {
    institutes: Institute[];
    loading: boolean;
    canEdit: boolean;
    onView: (institute: Institute) => void;
    onEdit: (institute: Institute) => void;
    onDelete: (institute: Institute) => void;
}

function InstituteTable({
    institutes,
    loading,
    canEdit,
    onView,
    onEdit,
    onDelete,
}: InstituteTableProps) {
    return (
        <div className="institute-table-wrapper">
            <table className="institute-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên viện</th>
                        <th>Mô tả</th>
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
                    {!loading && institutes.length === 0 && (
                        <tr>
                            <td colSpan={5} className="muted">
                                Chưa có viện nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        institutes.map((inst) => (
                            <tr key={inst.institute_id}>
                                <td>{inst.institute_id}</td>
                                <td>{inst.institute_name}</td>
                                <td>{inst.description || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(inst)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(inst)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(inst)}
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

export default InstituteTable;

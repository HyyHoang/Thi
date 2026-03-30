import { Institute } from '../../../types';

import { Button } from '../../../components/ui/Button';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
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
            <table className="data-table">
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
                                    <div className="action-group" style={{ display: 'flex', gap: '8px' }}>
                                        <Button variant="ghost" onClick={() => onView(inst)} title="Xem chi tiết" style={{ padding: '6px 10px' }}>
                                            <MdVisibility size={18} />
                                        </Button>
                                        {canEdit && (
                                            <>
                                                <Button variant="secondary" onClick={() => onEdit(inst)} title="Sửa" style={{ padding: '6px 10px' }}>
                                            <MdEdit size={18} color="#2563eb" />
                                        </Button>
                                                <Button variant="ghost" onClick={() => onDelete(inst)} title="Xóa" style={{ padding: '6px 10px', color: '#dc2626' }}>
                                            <MdDelete size={18} />
                                        </Button>
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

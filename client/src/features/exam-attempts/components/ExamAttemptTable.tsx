import { ExamAttempt } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

interface ExamAttemptTableProps {
  attempts: ExamAttempt[];
  loading: boolean;
  canEdit: boolean;
  onView: (attempt: ExamAttempt) => void;
  onViewResult?: (attempt: ExamAttempt) => void;
  onEdit: (attempt: ExamAttempt) => void;
  onDelete: (attempt: ExamAttempt) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  in_progress: { label: 'Đang làm', color: '#f59e0b' },
  submitted:   { label: 'Đã nộp bài', color: '#10b981' },
  expired:     { label: 'Hết hạn', color: '#ef4444' },
};

function ExamAttemptTable({
  attempts,
  loading,
  canEdit,
  onView,
  onViewResult,
  onEdit,
  onDelete,
}: ExamAttemptTableProps) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Đề thi</th>
            <th>Sinh viên</th>
            <th>Bắt đầu</th>
            <th>Nộp bài</th>
            <th>Trạng thái</th>
            <th>IP</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading && attempts.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">Đang tải dữ liệu...</td>
            </tr>
          )}
          {!loading && attempts.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">Không có lượt làm bài nào.</td>
            </tr>
          )}
          {attempts.length > 0 &&
            attempts.map((row) => (
              <tr key={row.attempt_id}>
                <td>{row.exam_title || row.exam_id}</td>
                <td>{`${row.student_name} (${row.student_id})`}</td>
                <td>{row.start_time}</td>
                <td>{row.submit_time || '-'}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: `${(statusMap[row.status] || { color: '#6b7280' }).color}20`,
                      color: (statusMap[row.status] || { color: '#6b7280' }).color,
                      fontWeight: 500,
                      fontSize: '13px',
                    }}
                  >
                    {(statusMap[row.status] || { label: row.status }).label}
                  </span>
                </td>
                <td>{row.ip_address || '-'}</td>
                <td>
                  <div className="action-group" style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="ghost"
                      onClick={() => onView(row)}
                      title="Xem chi tiết"
                      style={{ padding: '6px 10px' }}
                    >
                      <MdVisibility size={18} />
                    </Button>
                    {(row.status === 'submitted' && onViewResult) && (
                        <Button
                          variant="secondary"
                          onClick={() => onViewResult(row)}
                          title="Xem kết quả"
                          style={{ padding: '6px 10px', color: '#10b981' }}
                        >
                          Kết quả
                        </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => onEdit(row)}
                          title="Chỉnh sửa"
                          style={{ padding: '6px 10px' }}
                        >
                          <MdEdit size={18} color="#2563eb" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => onDelete(row)}
                          title="Xóa"
                          style={{ padding: '6px 10px', color: '#dc2626' }}
                        >
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

export default ExamAttemptTable;

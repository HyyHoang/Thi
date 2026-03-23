import { Question } from '../../../../types';

interface QuestionTableProps {
    questions: Question[];
    loading: boolean;
    canEdit: (question: Question) => boolean;
    canDelete: (question: Question) => boolean;
    onView: (question: Question) => void;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
}

function QuestionTable({
    questions,
    loading,
    canEdit,
    canDelete,
    onView,
    onEdit,
    onDelete,
}: QuestionTableProps) {
    const getTypeName = (type: string) => {
        switch (type) {
            case 'single': return 'Trắc nghiệm 1 ĐÁ';
            case 'multiple': return 'Trắc nghiệm nhiều ĐÁ';
            case 'essay': return 'Tự luận';
            default: return type;
        }
    };

    return (
        <div className="question-table-wrapper">
            <table className="question-table">
                <thead>
                    <tr>
                        <th>Mã CH</th>
                        <th>Nội dung</th>
                        <th>Loại</th>
                        <th>Người tạo</th>
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
                    {!loading && questions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="muted">
                                Chưa có câu hỏi nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        questions.map((q) => (
                            <tr key={q.QuestionID}>
                                <td>{q.QuestionID}</td>
                                <td>{q.Content.length > 50 ? q.Content.substring(0, 50) + '...' : q.Content}</td>
                                <td>{getTypeName(q.Type)}</td>
                                <td>{q.UserID || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(q)}
                                        >
                                            Xem
                                        </button>
                                        {canEdit(q) && (
                                            <button
                                                type="button"
                                                className="ghost-btn"
                                                onClick={() => onEdit(q)}
                                            >
                                                Sửa
                                            </button>
                                        )}
                                        {canDelete(q) && (
                                            <button
                                                type="button"
                                                className="danger-btn"
                                                onClick={() => onDelete(q)}
                                            >
                                                Xóa
                                            </button>
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

export default QuestionTable;

import { Question } from '../../../../types';

interface QuestionTableProps {
    questions: Question[];
    loading: boolean;
    canEdit: (question: Question) => boolean;
    canDelete: (question: Question) => boolean;
    onView: (question: Question) => void;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
}

function QuestionTable({
    questions,
    loading,
    canEdit,
    canDelete,
    onView,
    onEdit,
    onDelete,
    selectedIds = [],
    onSelectionChange,
}: QuestionTableProps) {
    const getTypeName = (type: string) => {
        switch (type) {
            case 'single': return 'Trắc nghiệm 1 ĐÁ';
            case 'multiple': return 'Trắc nghiệm nhiều ĐÁ';
            case 'essay': return 'Tự luận';
            default: return type;
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            onSelectionChange(questions.map((q) => q.QuestionID));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((x) => x !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const isAllSelected = questions.length > 0 && questions.every(q => selectedIds.includes(q.QuestionID));

    const colSpan = onSelectionChange ? 6 : 5;

    return (
        <div className="question-table-wrapper">
            <table className="question-table">
                <thead>
                    <tr>
                        {onSelectionChange && (
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
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
                            <td colSpan={colSpan} className="muted">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    )}
                    {!loading && questions.length === 0 && (
                        <tr>
                            <td colSpan={colSpan} className="muted">
                                Chưa có câu hỏi nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        questions.map((q) => (
                            <tr key={q.QuestionID}>
                                {onSelectionChange && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(q.QuestionID)}
                                            onChange={() => handleSelectOne(q.QuestionID)}
                                        />
                                    </td>
                                )}
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

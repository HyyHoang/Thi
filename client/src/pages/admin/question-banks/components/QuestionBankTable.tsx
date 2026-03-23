import React from 'react';
import { QuestionBank, Subject } from '../../../../types';

interface QuestionBankTableProps {
    banks: QuestionBank[];
    subjects: Subject[];
    loading: boolean;
    canModifyBank: (bank: QuestionBank) => boolean;
    onView: (bank: QuestionBank) => void;
    onEdit: (bank: QuestionBank) => void;
    onDelete: (bank: QuestionBank) => void;
}

function QuestionBankTable({
    banks,
    subjects,
    loading,
    canModifyBank,
    onView,
    onEdit,
    onDelete,
}: QuestionBankTableProps) {
    const subjectNameFor = (bank: QuestionBank) => {
        if (bank.subject_name) return bank.subject_name;
        const found = subjects.find((s) => s.SubjectID === bank.subject_id);
        return found?.SubjectName || '-';
    };

    return (
        <div className="department-table-wrapper">
            <table className="department-table">
                <thead>
                    <tr>
                        <th>BankID</th>
                        <th>Tên ngân hàng</th>
                        <th>Môn học</th>
                        <th>Số chương</th>
                        <th>Người tạo</th>
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
                    {!loading && banks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="muted">
                                Chưa có ngân hàng nào.
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        banks.map((bank) => (
                            <tr key={bank.bank_id}>
                                <td>{bank.bank_id}</td>
                                <td>{bank.bank_name}</td>
                                <td>{subjectNameFor(bank)}</td>
                                <td>{bank.chapter_count}</td>
                                <td>{bank.creator_username || bank.user_id}</td>
                                <td>{bank.created_date || '-'}</td>
                                <td>
                                    <div className="action-group">
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => onView(bank)}
                                        >
                                            Xem
                                        </button>
                                        {canModifyBank(bank) && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="ghost-btn"
                                                    onClick={() => onEdit(bank)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => onDelete(bank)}
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

export default QuestionBankTable;

import React from 'react';
import { QuestionBankPayload, Subject } from '../../../../types';

interface QuestionBankFormProps {
    values: QuestionBankPayload & { subject_id: number | string };
    subjects: Subject[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof QuestionBankPayload, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    /** Chỉ dùng khi tạo mới: số chương + tên từng chương */
    chapterNames?: string[];
    onChapterCountChange?: (count: number) => void;
    onChapterNameChange?: (index: number, value: string) => void;
}

function QuestionBankForm({
    values,
    subjects,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
    chapterNames,
    onChapterCountChange,
    onChapterNameChange,
}: QuestionBankFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên ngân hàng
                <input
                    type="text"
                    name="bank_name"
                    value={values.bank_name}
                    onChange={(e) => onChange('bank_name', e.target.value)}
                />
                {errors.bank_name && <span className="field-error">{errors.bank_name}</span>}
            </label>

            <label>
                Môn học
                <select
                    name="subject_id"
                    value={values.subject_id}
                    onChange={(e) => onChange('subject_id', e.target.value)}
                >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map((s) => (
                        <option key={s.SubjectID} value={String(s.SubjectID)}>
                            {s.SubjectName}
                        </option>
                    ))}
                </select>
                {errors.subject_id && <span className="field-error">{errors.subject_id}</span>}
            </label>

            <label>
                Mô tả
                <textarea
                    name="description"
                    rows={4}
                    value={values.description || ''}
                    onChange={(e) => onChange('description', e.target.value)}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
            </label>

            {mode === 'create' &&
                chapterNames &&
                onChapterCountChange &&
                onChapterNameChange && (
                    <div className="qb-create-chapters">
                        <div className="qb-create-chapters-title">Chương (bắt buộc)</div>
                        <label>
                            Số chương
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={chapterNames.length}
                                onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    onChapterCountChange(Number.isFinite(n) ? n : 1);
                                }}
                            />
                        </label>
                        {errors.chapters && (
                            <span className="field-error">{errors.chapters}</span>
                        )}
                        {chapterNames.map((name, index) => (
                            <label key={index}>
                                Tên chương {index + 1}
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => onChapterNameChange(index, e.target.value)}
                                    placeholder={`Nhập tên chương ${index + 1}`}
                                />
                            </label>
                        ))}
                    </div>
                )}

            <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onCancel}>
                    Hủy
                </button>
                <button type="submit" className="primary-btn">
                    {mode === 'create' ? 'Lưu' : 'Cập nhật'}
                </button>
            </div>
        </form>
    );
}

export default QuestionBankForm;

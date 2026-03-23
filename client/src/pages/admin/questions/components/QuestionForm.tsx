import React from 'react';
import { QuestionPayload, QuestionOption, Subject } from '../../../../types';

interface QuestionFormProps {
    values: QuestionPayload;
    subjects: Subject[];
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: keyof QuestionPayload, value: any) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function QuestionForm({
    values,
    subjects,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: QuestionFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    const handleOptionsChange = (index: number, field: keyof QuestionOption, val: any) => {
        const newOptions = [...(values.options || [])];
        if (!newOptions[index]) return;
        newOptions[index] = { ...newOptions[index], [field]: val };
        onChange('options', newOptions);
    };

    const addOption = () => {
        const newOptions = [...(values.options || [])];
        newOptions.push({
            OptionID: 0,
            Content: '',
            IsCorrect: false,
            OrderNumber: newOptions.length + 1
        });
        onChange('options', newOptions);
    };

    const removeOption = (index: number) => {
        const newOptions = [...(values.options || [])];
        newOptions.splice(index, 1);
        onChange('options', newOptions);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Môn học <span style={{ color: 'red' }}>*</span>
                <select
                    name="SubjectID"
                    value={values.SubjectID || ''}
                    required
                    onChange={(e) => onChange('SubjectID', e.target.value)}
                >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map((s) => (
                        <option key={s.SubjectID} value={s.SubjectID}>
                            {s.SubjectName}
                        </option>
                    ))}
                </select>
                {errors.SubjectID && <span className="field-error">{errors.SubjectID}</span>}
            </label>

            <label>
                Loại câu hỏi <span style={{ color: 'red' }}>*</span>
                <select
                    name="Type"
                    value={values.Type}
                    required
                    onChange={(e) => onChange('Type', e.target.value)}
                >
                    <option value="single">Trắc nghiệm một đáp án</option>
                    <option value="multiple">Trắc nghiệm nhiều đáp án</option>
                    <option value="essay">Tự luận</option>
                </select>
                {errors.Type && <span className="field-error">{errors.Type}</span>}
            </label>

            <label>
                Nội dung câu hỏi <span style={{ color: 'red' }}>*</span>
                <textarea
                    name="Content"
                    rows={3}
                    value={values.Content}
                    required
                    onChange={(e) => onChange('Content', e.target.value)}
                />
                {errors.Content && (
                    <span className="field-error">{errors.Content}</span>
                )}
            </label>

            {values.Type === 'essay' && (
                <label>
                    Đáp án mẫu
                    <textarea
                        name="CorrectAnswer"
                        rows={3}
                        value={values.CorrectAnswer || ''}
                        onChange={(e) => onChange('CorrectAnswer', e.target.value)}
                    />
                </label>
            )}

            {(values.Type === 'single' || values.Type === 'multiple') && (
                <div className="options-list">
                    <strong>Các đáp án:</strong>
                    {(values.options || []).map((opt, idx) => (
                        <div key={idx} className="option-item">
                            <input
                                type={values.Type === 'single' ? 'radio' : 'checkbox'}
                                name="isCorrectGroup"
                                checked={!!opt.IsCorrect}
                                onChange={(e) => {
                                    if (values.Type === 'single') {
                                        const resetOpts = (values.options || []).map((o, i) => ({
                                            ...o,
                                            IsCorrect: i === idx
                                        }));
                                        onChange('options', resetOpts);
                                    } else {
                                        handleOptionsChange(idx, 'IsCorrect', e.target.checked);
                                    }
                                }}
                            />
                            <input
                                type="text"
                                placeholder={`Đáp án ${idx + 1}`}
                                value={opt.Content}
                                required
                                onChange={(e) => handleOptionsChange(idx, 'Content', e.target.value)}
                            />
                            <button type="button" className="danger-btn add-option-btn" onClick={() => removeOption(idx)}>Xóa</button>
                        </div>
                    ))}
                    <button type="button" className="ghost-btn add-option-btn" onClick={addOption}>
                        + Thêm đáp án
                    </button>
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

export default QuestionForm;

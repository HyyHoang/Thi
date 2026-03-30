import { InstitutePayload } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface InstituteFormProps {
    values: InstitutePayload;
    errors: Record<string, string>;
    submitError?: string;
    mode: 'create' | 'edit';
    onChange: (field: string | number | symbol, value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function InstituteForm({
    values,
    errors,
    submitError,
    mode,
    onChange,
    onSubmit,
    onCancel,
}: InstituteFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div className="alert error">{submitError}</div>}

            <label>
                Tên viện
                <input
                    type="text"
                    name="institute_name"
                    value={values.institute_name}
                    onChange={(e) => onChange('institute_name', e.target.value)}
                />
                {errors.institute_name && (
                    <span className="field-error">{errors.institute_name}</span>
                )}
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

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" variant="primary">
                    {mode === 'create' ? 'Lưu' : 'Cập nhật'}
                </Button>
            </div>
        </form>
    );
}

export default InstituteForm;

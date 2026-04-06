import { Result } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface ResultDetailModalProps {
    result: Result;
    onClose: () => void;
}

export default function ResultDetailModal({ result, onClose }: ResultDetailModalProps) {
    if (!result) return null;

    return (
        <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                    <p><strong>Học viên:</strong> {result.student_name} ({result.student_id})</p>
                    <p><strong>Bài thi:</strong> {result.exam_title}</p>
                    <p><strong>Lượt làm bài (Attempt ID):</strong> {result.attempt_id}</p>
                </div>
                <div>
                    <p><strong>Điểm số:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{result.score}</span></p>
                    <p><strong>Số câu đúng:</strong> {result.correct_answers}</p>
                    <p><strong>Thời gian làm bài:</strong> {result.working_time} giây</p>
                    <p><strong>Ngày nộp:</strong> {result.created_at ? new Date(result.created_at).toLocaleString('vi-VN') : '-'}</p>
                </div>
            </div>

            <h4>Chi tiết từng câu trả lời:</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
                {(!result.student_answers || result.student_answers.length === 0) ? (
                    <p>Không có chi tiết các câu trả lời.</p>
                ) : (
                    result.student_answers.map((ans, idx) => (
                        <div key={ans.student_answer_id} style={{ 
                            padding: '10px', 
                            marginBottom: '10px', 
                            borderLeft: `4px solid ${ans.is_correct ? '#28a745' : '#dc3545'}`,
                            backgroundColor: '#f9f9f9' 
                        }}>
                            <p><strong>Câu {idx + 1}:</strong> {ans.content}</p>
                            <p><strong>Đáp án đã chọn:</strong> {ans.selected_answer || <em>(Bỏ trống)</em>}</p>
                            <p><strong>Đáp án đúng:</strong> {ans.correct_answer || '-'}</p>
                            <p style={{ color: ans.is_correct ? '#28a745' : '#dc3545', fontWeight: 'bold', margin: '5px 0 0' }}>
                                {ans.is_correct ? 'ĐÚNG' : 'SAI'}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </div>
    );
}

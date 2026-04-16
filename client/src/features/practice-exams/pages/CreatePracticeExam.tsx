import React, { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdSave } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { createPracticeExam } from '../../../services/practiceExamService';
import subjectService from '../../../services/subjectService';
import { Subject } from '../../../types';
import './CreatePracticeExam.css';

interface OptionInput {
  Content: string;
  IsCorrect: boolean;
}

interface QuestionInput {
  Content: string;
  Type: 'single' | 'multiple';
  options: OptionInput[];
}

export default function CreatePracticeExam() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { Content: '', Type: 'single', options: [{ Content: '', IsCorrect: true }, { Content: '', IsCorrect: false }] }
  ]);

  useEffect(() => {
    subjectService.getAll().then((res) => {
      setSubjects(res.data);
      if (res.data.length > 0) setSubjectId(res.data[0].SubjectID);
    }).catch(() => setError('Lỗi khi tải môn học'));
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { Content: '', Type: 'single', options: [{ Content: '', IsCorrect: true }, { Content: '', IsCorrect: false }] }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddOption = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.push({ Content: '', IsCorrect: false });
    setQuestions(newQs);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.splice(oIndex, 1);
    setQuestions(newQs);
  };

  const handleSave = async () => {
    if (!title.trim() || !subjectId || questions.length === 0) {
      setError('Vui lòng điền đầy đủ thông tin đề thi và ít nhất 1 câu hỏi.');
      return;
    }
    
    // Validate
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.Content.trim()) {
            setError(`Câu hỏi ${i + 1} trống nội dung.`);
            return;
        }
        if (q.options.length < 2) {
            setError(`Câu hỏi ${i + 1} phải có ít nhất 2 đáp án.`);
            return;
        }
        if (!q.options.some(o => o.IsCorrect)) {
            setError(`Câu hỏi ${i + 1} phải có ít nhất 1 đáp án đúng.`);
            return;
        }
        for (let j = 0; j < q.options.length; j++) {
            if (!q.options[j].Content.trim()) {
                setError(`Đáp án ${j + 1} của câu ${i + 1} trống nội dung.`);
                return;
            }
        }
    }

    setLoading(true);
    setError('');
    try {
      await createPracticeExam({
        Title: title,
        SubjectID: subjectId,
        Duration: duration,
        questions: questions
      });
      navigate('/student/practice-exams');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu đề thi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-practice-exam-container">
      <h2>Tạo đề thi ôn tập</h2>
      {error && <div className="alert error">{error}</div>}
      
      <div className="exam-info-card">
        <div className="form-group">
          <label>Tên đề thi *</label>
          <input 
            type="text" 
            placeholder="Ví dụ: Ôn tập Giữa kỳ Thiết kế Web" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </div>
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Môn học *</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
              {subjects.map(s => (
                <option key={s.SubjectID} value={s.SubjectID}>{s.SubjectName}</option>
              ))}
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Thời gian làm bài (phút) *</label>
            <input 
              type="number" 
              min={5} 
              value={duration} 
              onChange={e => setDuration(parseInt(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <div className="questions-list">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-item-card">
            <div className="question-header">
              <h4>Câu hỏi {qIndex + 1}</h4>
              <button className="icon-btn-danger" onClick={() => handleRemoveQuestion(qIndex)}><MdDelete /></button>
            </div>
            <div className="form-row">
                <div className="form-group flex-1">
                    <label>Nội dung câu hỏi</label>
                    <textarea 
                        rows={3} 
                        value={q.Content} 
                        onChange={e => {
                            const newQs = [...questions];
                            newQs[qIndex].Content = e.target.value;
                            setQuestions(newQs);
                        }}
                    />
                </div>
                <div className="form-group" style={{ width: '200px' }}>
                    <label>Loại câu hỏi</label>
                    <select 
                        value={q.Type} 
                        onChange={e => {
                            const newQs = [...questions];
                            newQs[qIndex].Type = e.target.value as 'single'|'multiple';
                            // If switching to single, only keep the first correct answer
                            if (e.target.value === 'single') {
                                let foundCorrect = false;
                                newQs[qIndex].options = newQs[qIndex].options.map(o => {
                                    if (o.IsCorrect && !foundCorrect) {
                                        foundCorrect = true;
                                        return o;
                                    }
                                    return { ...o, IsCorrect: false };
                                });
                            }
                            setQuestions(newQs);
                        }}
                    >
                        <option value="single">Một đáp án đúng</option>
                        <option value="multiple">Nhiều đáp án đúng</option>
                    </select>
                </div>
            </div>

            <div className="options-list">
                <label>Các đáp án</label>
                {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="option-row">
                        <input 
                            type={q.Type === 'single' ? 'radio' : 'checkbox'} 
                            checked={opt.IsCorrect}
                            onChange={(e) => {
                                const newQs = [...questions];
                                if (q.Type === 'single') {
                                    newQs[qIndex].options.forEach(o => o.IsCorrect = false);
                                }
                                newQs[qIndex].options[oIndex].IsCorrect = e.target.checked;
                                setQuestions(newQs);
                            }}
                        />
                        <input 
                            type="text" 
                            className="flex-1"
                            placeholder={`Đáp án ${oIndex + 1}`}
                            value={opt.Content}
                            onChange={(e) => {
                                const newQs = [...questions];
                                newQs[qIndex].options[oIndex].Content = e.target.value;
                                setQuestions(newQs);
                            }}
                        />
                        <button className="icon-btn-danger" onClick={() => handleRemoveOption(qIndex, oIndex)}><MdDelete /></button>
                    </div>
                ))}
                <button className="text-primary-btn" onClick={() => handleAddOption(qIndex)}>
                    + Thêm đáp án
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="actions-footer">
        <button className="btn-secondary" onClick={handleAddQuestion}>
          <MdAdd /> Thêm câu hỏi
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          <MdSave /> {loading ? 'Đang lưu...' : 'Lưu đề thi'}
        </button>
      </div>
    </div>
  );
}

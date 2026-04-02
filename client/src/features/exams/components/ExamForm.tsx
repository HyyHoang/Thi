import React, { useState, useEffect } from 'react';
import examService from '../../../services/examService';
import { Exam, ExamChapterConfig, ExamPayload } from '../../../types';
import questionBankService from '../../../services/questionBankService';
interface SemesterInfo {
    semester_id: string;
    semester_name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
}

interface ChapterInfo {
    chapter_id: number;
    chapter_number: number;
    chapter_name: string;
    question_count: number;
}

interface BankInfo {
    bank_id: string;
    bank_name: string;
    subject_id: string;
    chapters: ChapterInfo[];
}

interface CourseSectionOption {
    SectionID: string;
    SectionName: string;
    SubjectID: string;
    SemesterID: string;
}

interface ExamFormProps {
    exam?: Exam | null;
    onSubmit: (payload: ExamPayload) => Promise<void>;
    onCancel: () => void;
    submitting?: boolean;
}

const STEPS = ['Thông tin cơ bản', 'Ngân hàng & Chương', 'Cấu hình bổ sung'];

const ExamForm: React.FC<ExamFormProps> = ({ exam, onSubmit, onCancel, submitting }) => {
    const isEdit = !!exam;
    const [step, setStep] = useState(0);

    // Step 1 state
    const [currentSemester, setCurrentSemester] = useState<SemesterInfo | null>(null);
    const [semesterLoading, setSemesterLoading] = useState(false);
    const [semesterError, setSemesterError] = useState<string | null>(null);
    const [courseSections, setCourseSections] = useState<CourseSectionOption[]>([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(exam?.section_id || '');
    const [title, setTitle] = useState(exam?.title || '');
    const [startTime, setStartTime] = useState(exam?.start_time ? exam.start_time.replace(' ', 'T').slice(0, 16) : '');
    const [endTime, setEndTime] = useState(exam?.end_time ? exam.end_time.replace(' ', 'T').slice(0, 16) : '');
    const [duration, setDuration] = useState<number>(exam?.duration || 60);

    // Step 2 state
    const [banks, setBanks] = useState<BankInfo[]>([]);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [banksLoading, setBanksLoading] = useState(false);
    const [selectedChapters, setSelectedChapters] = useState<Map<number, number>>(new Map());
    // Map<chapter_number, question_count>

    // Step 3 state
    const [passwordEnabled, setPasswordEnabled] = useState(exam?.password_enabled || false);
    const [password, setPassword] = useState('');

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 2 Create inline bank state
    const [isCreatingBank, setIsCreatingBank] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [newBankChaptersCount, setNewBankChaptersCount] = useState(1);
    const [newBankChapterNames, setNewBankChapterNames] = useState<string[]>(['Chương 1']);
    const [creatingBankLoading, setCreatingBankLoading] = useState(false);
    const [createBankError, setCreateBankError] = useState<string | null>(null);

    const handleChapterCountChange = (n: number) => {
        const count = Math.max(1, Math.min(50, n));
        setNewBankChaptersCount(count);
        const newNames = [];
        for (let i = 0; i < count; i++) {
            newNames.push(newBankChapterNames[i] || `Chương ${i + 1}`);
        }
        setNewBankChapterNames(newNames);
    };

    const handleCreateBank = async () => {
        if (!newBankName.trim()) {
            setCreateBankError("Vui lòng nhập tên ngân hàng.");
            return;
        }

        const section = courseSections.find(s => s.SectionID === selectedSectionId);
        if (!section) return;

        setCreatingBankLoading(true);
        setCreateBankError(null);

        try {
            const payload = {
                bank_name: newBankName.trim(),
                subject_id: section.SubjectID,
                chapters: newBankChapterNames.map((name, i) => ({
                    chapter_number: i + 1,
                    chapter_name: name || `Chương ${i + 1}`
                }))
            };

            await questionBankService.create(payload);
            
            // Re-fetch banks
            const banksRes: any = await examService.getBanksForSubject(section.SubjectID);
            const data: BankInfo[] = banksRes?.data || banksRes || [];
            setBanks(data);
            
            // Select the newly created one
            const created = data.find(b => b.bank_name === payload.bank_name);
            if (created) setSelectedBankId(created.bank_id);
            
            setIsCreatingBank(false);
            setNewBankName('');
            setNewBankChaptersCount(1);
            setNewBankChapterNames(['Chương 1']);

        } catch (err: any) {
            setCreateBankError(err.response?.data?.message || err.message || "Lỗi khi tạo ngân hàng");
        } finally {
            setCreatingBankLoading(false);
        }
    };

    // ── Load current semester ──
    useEffect(() => {
        setSemesterLoading(true);
        setSemesterError(null);
        examService.getCurrentSemester()
            .then((res: any) => {
                const data = res?.data || res;
                setCurrentSemester(data || null);
                if (data) {
                    loadSectionsForSemester(data.semester_id);
                } else {
                    setSemesterError('Không có học kỳ đang diễn ra. Không thể tạo đề thi.');
                }
            })
            .catch(() => setSemesterError('Không thể tải thông tin học kỳ hiện tại.'))
            .finally(() => setSemesterLoading(false));
    }, []);

    const loadSectionsForSemester = async (semesterId: string) => {
        setSectionsLoading(true);
        try {
            // Load all course-sections and filter by semester
            const axiosClient = (await import('../../../lib/api/axiosClient')).default;
            const secRes: any = await axiosClient.get('/course-sections');
            const allSections: CourseSectionOption[] = secRes?.data || secRes || [];
            const filtered = allSections.filter((s: CourseSectionOption) => s.SemesterID === semesterId);
            setCourseSections(filtered);
        } catch {
            setSemesterError('Không thể tải danh sách lớp học phần.');
        } finally {
            setSectionsLoading(false);
        }
    };

    // ── Load banks when section changes ──
    useEffect(() => {
        if (!selectedSectionId) {
            setBanks([]);
            setSelectedBankId('');
            setSelectedChapters(new Map());
            return;
        }
        const section = courseSections.find(s => s.SectionID === selectedSectionId);
        if (!section) return;

        setBanksLoading(true);
        examService.getBanksForSubject(section.SubjectID)
            .then((res: any) => {
                const data: BankInfo[] = res?.data || res || [];
                setBanks(data);
                if (data.length === 1) setSelectedBankId(data[0].bank_id);
            })
            .catch(() => setBanks([]))
            .finally(() => setBanksLoading(false));
    }, [selectedSectionId, courseSections]);

    // ── Pre-fill chapter configs when editing ──
    useEffect(() => {
        if (isEdit && exam?.chapter_configs && exam.chapter_configs.length > 0 && banks.length > 0) {
            const firstBank = exam.chapter_configs[0].bank_id;
            setSelectedBankId(firstBank);
            const map = new Map<number, number>();
            exam.chapter_configs.forEach(cfg => {
                map.set(cfg.chapter_number, cfg.question_count);
            });
            setSelectedChapters(map);
        }
    }, [isEdit, exam, banks]);

    const currentBank = banks.find(b => b.bank_id === selectedBankId);

    const toggleChapter = (chapterNumber: number) => {
        setSelectedChapters(prev => {
            const next = new Map(prev);
            if (next.has(chapterNumber)) {
                next.delete(chapterNumber);
            } else {
                next.set(chapterNumber, 1);
            }
            return next;
        });
    };

    const setChapterCount = (chapterNumber: number, count: number) => {
        setSelectedChapters(prev => {
            const next = new Map(prev);
            next.set(chapterNumber, Math.max(1, count));
            return next;
        });
    };

    const totalQuestions = Array.from(selectedChapters.values()).reduce((s, v) => s + v, 0);

    // ── Validation per step ──
    const validateStep1 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!title.trim()) errs.title = 'Vui lòng nhập tiêu đề đề thi.';
        if (!selectedSectionId) errs.section = 'Vui lòng chọn lớp học phần.';
        if (!startTime) errs.startTime = 'Vui lòng chọn thời gian bắt đầu.';
        if (!endTime) errs.endTime = 'Vui lòng chọn thời gian kết thúc.';
        if (startTime && endTime && new Date(startTime) >= new Date(endTime))
            errs.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu.';
        if (!duration || duration < 1) errs.duration = 'Thời gian làm bài phải ≥ 1 phút.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!selectedBankId) errs.bank = 'Vui lòng chọn ngân hàng câu hỏi.';
        if (selectedChapters.size === 0) errs.chapters = 'Vui lòng chọn ít nhất một chương.';
        // Check each chapter has enough questions
        if (currentBank) {
            selectedChapters.forEach((count, chapterNum) => {
                const ch = currentBank.chapters.find(c => c.chapter_number === chapterNum);
                if (ch && count > ch.question_count) {
                    errs[`ch_${chapterNum}`] = `Chương ${ch.chapter_name} chỉ có ${ch.question_count} câu.`;
                }
                if (count < 1) {
                    errs[`ch_${chapterNum}`] = `Số câu phải ≥ 1.`;
                }
            });
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (step === 0 && !validateStep1()) return;
        if (step === 1 && !validateStep2()) return;
        setStep(s => s + 1);
    };

    const handleBack = () => {
        setErrors({});
        setStep(s => s - 1);
    };

    const handleSubmit = async () => {
        const chapterConfigs: ExamChapterConfig[] = [];
        selectedChapters.forEach((count, chapterNum) => {
            chapterConfigs.push({
                bank_id: selectedBankId,
                chapter_number: chapterNum,
                question_count: count,
            });
        });

        const payload: ExamPayload = {
            title: title.trim(),
            section_id: selectedSectionId,
            duration,
            start_time: startTime.replace('T', ' ') + ':00',
            end_time: endTime.replace('T', ' ') + ':00',
            password_exam: passwordEnabled && password.trim() ? password.trim() : null,
            chapter_configs: chapterConfigs,
        };

        await onSubmit(payload);
    };

    const selectedSection = courseSections.find(s => s.SectionID === selectedSectionId);

    return (
        <div className="exam-form">
            {/* Step indicator */}
            <div className="exam-form-steps">
                {STEPS.map((label, i) => (
                    <div key={i} className={`exam-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                        <div className="exam-step-circle">{i < step ? '✓' : i + 1}</div>
                        <span className="exam-step-label">{label}</span>
                        {i < STEPS.length - 1 && <div className="exam-step-line" />}
                    </div>
                ))}
            </div>

            {/* ── Step 1: Thông tin cơ bản ── */}
            {step === 0 && (
                <div className="exam-form-step-content">
                    {semesterLoading && <p className="form-hint">Đang tải thông tin học kỳ...</p>}
                    {semesterError && <div className="form-error-box">{semesterError}</div>}

                    {currentSemester && (
                        <div className="form-group">
                            <label>Học kỳ hiện tại</label>
                            <div className="form-static">
                                {currentSemester.semester_name} — {currentSemester.academic_year}
                                <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    ({currentSemester.start_date} → {currentSemester.end_date})
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Lớp học phần <span className="required">*</span></label>
                        {sectionsLoading ? (
                            <p className="form-hint">Đang tải lớp học phần...</p>
                        ) : (
                            <select
                                value={selectedSectionId}
                                onChange={e => setSelectedSectionId(e.target.value)}
                                disabled={!currentSemester}
                            >
                                <option value="">— Chọn lớp học phần —</option>
                                {courseSections.map(s => (
                                    <option key={s.SectionID} value={s.SectionID}>
                                        {s.SectionName}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.section && <span className="form-error">{errors.section}</span>}
                    </div>

                    <div className="form-group">
                        <label>Tiêu đề đề thi <span className="required">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="VD: Thi cuối kỳ Lập trình Web"
                        />
                        {errors.title && <span className="form-error">{errors.title}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Thời gian bắt đầu <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                            {errors.startTime && <span className="form-error">{errors.startTime}</span>}
                        </div>
                        <div className="form-group">
                            <label>Thời gian kết thúc <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                            {errors.endTime && <span className="form-error">{errors.endTime}</span>}
                        </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: 200 }}>
                        <label>Thời gian làm bài (phút) <span className="required">*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                        />
                        {errors.duration && <span className="form-error">{errors.duration}</span>}
                    </div>
                </div>
            )}

            {/* ── Step 2: Ngân hàng & Chương ── */}
            {step === 1 && (
                <div className="exam-form-step-content">
                    <div className="form-group">
                        <label>Ngân hàng câu hỏi <span className="required">*</span></label>
                        {banksLoading ? (
                            <p className="form-hint">Đang tải ngân hàng câu hỏi...</p>
                        ) : (
                            <>
                                {banks.length === 0 && !isCreatingBank && (
                                    <div className="form-error-box" style={{ marginBottom: '10px' }}>
                                        Môn học của lớp này chưa có ngân hàng câu hỏi.
                                    </div>
                                )}
                                
                                {!isCreatingBank ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select
                                            style={{ flex: 1 }}
                                            value={selectedBankId}
                                            onChange={e => {
                                                setSelectedBankId(e.target.value);
                                                setSelectedChapters(new Map());
                                            }}
                                            disabled={banks.length === 0}
                                        >
                                            <option value="">— Chọn ngân hàng —</option>
                                            {banks.map(b => (
                                                <option key={b.bank_id} value={b.bank_id}>{b.bank_name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline"
                                            onClick={() => setIsCreatingBank(true)}
                                            title="Tạo mới ngân hàng câu hỏi"
                                        >
                                            + Tạo mới
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-create-box" style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Tạo ngân hàng câu hỏi mới</h4>
                                        
                                        {createBankError && <div className="form-error-box" style={{ marginBottom: '10px' }}>{createBankError}</div>}
                                        
                                        <div className="form-group">
                                            <label>Tên ngân hàng <span className="required">*</span></label>
                                            <input 
                                                type="text" 
                                                value={newBankName} 
                                                onChange={e => setNewBankName(e.target.value)} 
                                                placeholder="VD: Ngân hàng Cơ sở dữ liệu" 
                                            />
                                        </div>
                                        
                                        <div className="form-group" style={{ maxWidth: '200px' }}>
                                            <label>Số chương <span className="required">*</span></label>
                                            <input 
                                                type="number" 
                                                min={1} 
                                                max={50} 
                                                value={newBankChaptersCount} 
                                                onChange={e => handleChapterCountChange(Number(e.target.value))} 
                                            />
                                        </div>

                                        <div className="chapter-list">
                                            {newBankChapterNames.map((name, i) => (
                                                <div key={i} className="form-group" style={{ marginBottom: '10px' }}>
                                                    <label>Tên chương {i + 1}</label>
                                                    <input 
                                                        type="text" 
                                                        value={name} 
                                                        onChange={e => {
                                                            const newNames = [...newBankChapterNames];
                                                            newNames[i] = e.target.value;
                                                            setNewBankChapterNames(newNames);
                                                        }} 
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                            <button 
                                                type="button" 
                                                className="btn btn-primary"
                                                onClick={handleCreateBank}
                                                disabled={creatingBankLoading}
                                            >
                                                {creatingBankLoading ? 'Đang tạo...' : 'Lưu ngân hàng'}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={() => setIsCreatingBank(false)}
                                                disabled={creatingBankLoading}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {errors.bank && !isCreatingBank && <span className="form-error">{errors.bank}</span>}
                    </div>

                    {currentBank && (
                        <div className="form-group">
                            <label>Chọn chương & số câu <span className="required">*</span></label>
                            {errors.chapters && <span className="form-error">{errors.chapters}</span>}
                            <div className="chapter-list">
                                {currentBank.chapters.map(ch => {
                                    const isSelected = selectedChapters.has(ch.chapter_number);
                                    const count = selectedChapters.get(ch.chapter_number) || 1;
                                    const errKey = `ch_${ch.chapter_number}`;
                                    return (
                                        <div
                                            key={ch.chapter_number}
                                            className={`chapter-item ${isSelected ? 'selected' : ''}`}
                                        >
                                            <label className="chapter-check">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleChapter(ch.chapter_number)}
                                                />
                                                <span className="chapter-name">
                                                    Chương {ch.chapter_number}: {ch.chapter_name}
                                                    <span className="chapter-avail">({ch.question_count} câu có sẵn)</span>
                                                </span>
                                            </label>
                                            {isSelected && (
                                                <div className="chapter-count">
                                                    <label>Số câu:</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={ch.question_count}
                                                        value={count}
                                                        onChange={e => setChapterCount(ch.chapter_number, Number(e.target.value))}
                                                    />
                                                    {errors[errKey] && (
                                                        <span className="form-error">{errors[errKey]}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedChapters.size > 0 && (
                        <div className="exam-summary-box">
                            <strong>Tổng số câu hỏi sẽ lấy: </strong>
                            <span className="badge badge-primary" style={{ fontSize: '1rem' }}>
                                {totalQuestions} câu
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 3: Cấu hình bổ sung ── */}
            {step === 2 && (
                <div className="exam-form-step-content">
                    <div className="exam-review-card">
                        <h4>📋 Tóm tắt đề thi</h4>
                        <table className="review-table">
                            <tbody>
                                <tr><td>Học kỳ</td><td>{currentSemester?.semester_name}</td></tr>
                                <tr><td>Lớp học phần</td><td>{selectedSection?.SectionName || selectedSectionId}</td></tr>
                                <tr><td>Tiêu đề</td><td><strong>{title}</strong></td></tr>
                                <tr><td>Thời gian mở</td><td>{startTime?.replace('T', ' ')}</td></tr>
                                <tr><td>Thời gian đóng</td><td>{endTime?.replace('T', ' ')}</td></tr>
                                <tr><td>Thời gian làm bài</td><td>{duration} phút</td></tr>
                                <tr><td>Ngân hàng</td><td>{currentBank?.bank_name}</td></tr>
                                <tr>
                                    <td>Chương đã chọn</td>
                                    <td>
                                        {currentBank?.chapters
                                            .filter(ch => selectedChapters.has(ch.chapter_number))
                                            .map(ch => (
                                                <div key={ch.chapter_number}>
                                                    Chương {ch.chapter_number}: {ch.chapter_name}
                                                    — <strong>{selectedChapters.get(ch.chapter_number)} câu</strong>
                                                </div>
                                            ))
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tổng số câu</td>
                                    <td>
                                        <span className="badge badge-primary" style={{ fontSize: '0.95rem' }}>
                                            {totalQuestions} câu
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={passwordEnabled}
                                onChange={e => setPasswordEnabled(e.target.checked)}
                            />
                            <span>Bật mật khẩu bảo vệ đề thi</span>
                        </label>
                    </div>

                    {passwordEnabled && (
                        <div className="form-group">
                            <label>Mật khẩu đề thi <span className="required">*</span></label>
                            <input
                                type="text"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu..."
                                autoComplete="off"
                            />
                            {isEdit && !password && (
                                <span className="form-hint">Để trống = giữ nguyên mật khẩu cũ</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation buttons */}
            <div className="exam-form-footer">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Hủy
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {step > 0 && (
                        <button type="button" className="btn btn-outline" onClick={handleBack}>
                            ← Quay lại
                        </button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={!!semesterError || semesterLoading}
                        >
                            Tiếp theo →
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang lưu...' : isEdit ? '💾 Cập nhật' : '✅ Tạo đề thi'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamForm;

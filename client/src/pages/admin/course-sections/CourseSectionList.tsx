import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCourseSections } from '../../../features/course-sections/courseSectionSlice';
import {
  selectCourseSections,
  selectCourseSectionsError,
  selectCourseSectionsLoading,
} from '../../../features/course-sections/selectors';
import courseSectionService from '../../../services/courseSectionService';
import subjectService from '../../../services/subjectService';
import semesterService from '../../../services/semesterService';
import teacherProfileService from '../../../services/teacherProfileService';
import { CourseSection, CourseSectionPayload, Subject, Semester, TeacherProfile } from '../../../types';
import CourseSectionTable from './components/CourseSectionTable';
import CourseSectionForm from './components/CourseSectionForm';
import './CourseSectionList.css';

type ModalMode = 'create' | 'edit' | 'view' | 'delete';

const emptyForm: CourseSectionPayload = {
  SectionName: '',
  SubjectID: '',
  SemesterID: '',
  TeacherID: '',
  MaxStudent: 40,
};

function CourseSectionList() {
  const dispatch = useAppDispatch();
  const courseSections = useAppSelector(selectCourseSections);
  const loading = useAppSelector(selectCourseSectionsLoading);
  const error = useAppSelector(selectCourseSectionsError) || '';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [flash, setFlash] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [formData, setFormData] = useState<CourseSectionPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const canEdit = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user?.role === 0; // Only admin
    } catch {
      return false;
    }
  }, []);

  const loadDependencies = async () => {
    try {
      const [subjRes, semRes, teachRes] = await Promise.all([
        subjectService.getAll(),
        semesterService.getAll(),
        teacherProfileService.getAll(),
      ]);
      setSubjects((subjRes as any).data || (Array.isArray(subjRes) ? subjRes : []));
      setSemesters((semRes as any).data || []);
      setTeachers((teachRes as any).data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    dispatch(fetchCourseSections());
    loadDependencies();
  }, [dispatch]);

  const openModal = (mode: ModalMode, section: CourseSection | null = null) => {
    setModalMode(mode);
    setSelectedSection(section);
    setSubmitError('');
    setFormErrors({});
    setFlash('');

    if (mode === 'create') {
      setFormData(emptyForm);
    } else if (section) {
      setFormData({
        SectionName: section.SectionName || '',
        SubjectID: section.SubjectID || '',
        SemesterID: section.SemesterID || '',
        TeacherID: section.TeacherID || '',
        MaxStudent: section.MaxStudent || 40,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSection(null);
    setSubmitError('');
    setFormErrors({});
  };

  const handleFormChange = (field: keyof CourseSectionPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const payload: CourseSectionPayload = {
      SectionName: formData.SectionName,
      SubjectID: formData.SubjectID,
      SemesterID: formData.SemesterID,
      TeacherID: formData.TeacherID,
      MaxStudent: Number(formData.MaxStudent),
    };

    try {
      if (modalMode === 'create') {
        await courseSectionService.create(payload);
        setFlash('Thêm lớp học phần thành công');
      } else if (modalMode === 'edit' && selectedSection) {
        await courseSectionService.update(selectedSection.SectionID, payload);
        setFlash('Cập nhật lớp học phần thành công');
      }
      closeModal();
      dispatch(fetchCourseSections());
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors || {};
      if (Object.keys(apiErrors).length > 0) {
        const mapped: Record<string, string> = {};
        Object.keys(apiErrors).forEach((key) => {
          mapped[key] = apiErrors[key]?.[0] || '';
        });
        setFormErrors(mapped);
      }
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDelete = async (section: CourseSection) => {
    setSubmitError('');
    setFlash('');
    try {
      await courseSectionService.remove(section.SectionID);
      setFlash('Xóa lớp học phần thành công');
      closeModal();
      dispatch(fetchCourseSections());
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Không thể xóa lớp học phần.');
    }
  };

  return (
    <div className="course-section-page">
      <div className="course-section-header">
        <div>
          <h2>Quản lý Lớp học phần</h2>
          <p>Danh sách lớp học phần trong hệ thống</p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="primary-btn"
            onClick={() => openModal('create')}
          >
            Thêm lớp
          </button>
        )}
      </div>

      {flash && <div className="alert success">{flash}</div>}
      {error && <div className="alert error">{error}</div>}

      <CourseSectionTable
        courseSections={courseSections}
        loading={loading}
        canEdit={canEdit}
        onView={(sec) => openModal('view', sec)}
        onEdit={(sec) => openModal('edit', sec)}
        onDelete={(sec) => openModal('delete', sec)}
      />

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === 'create' && 'Thêm lớp học phần'}
                {modalMode === 'edit' && 'Chỉnh sửa lớp học phần'}
                {modalMode === 'view' && 'Thông tin lớp học phần'}
                {modalMode === 'delete' && 'Xóa lớp học phần'}
              </h3>
              <button type="button" className="icon-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <CourseSectionForm
                values={formData}
                subjects={subjects}
                semesters={semesters}
                teachers={teachers}
                errors={formErrors}
                submitError={submitError}
                mode={modalMode}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={closeModal}
              />
            )}

            {modalMode === 'view' && selectedSection && (
              <div className="modal-content">
                <p>
                  <strong>ID Lớp:</strong> {selectedSection.SectionID}
                </p>
                <p>
                  <strong>Tên lớp:</strong> {selectedSection.SectionName}
                </p>
                <p>
                  <strong>Môn học:</strong> {selectedSection.Subject?.SubjectName || selectedSection.SubjectID}
                </p>
                <p>
                  <strong>Học kỳ:</strong> {selectedSection.Semester?.SemesterName || selectedSection.SemesterID}
                </p>
                <p>
                  <strong>Giảng viên:</strong> {selectedSection.Teacher?.FullName || selectedSection.TeacherID}
                </p>
                <p>
                  <strong>Sĩ số tối đa:</strong> {selectedSection.MaxStudent}
                </p>
                <p>
                  <strong>Ngày tạo:</strong> {selectedSection.CreatedDate ? new Date(selectedSection.CreatedDate).toLocaleString('vi-VN') : '-'}
                </p>
                <div className="modal-actions">
                  <button type="button" className="primary-btn" onClick={closeModal}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'delete' && selectedSection && (
              <div className="modal-content">
                <p>
                  Bạn có chắc muốn xóa lớp học phần{' '}
                  <strong>{selectedSection.SectionName}</strong>?
                </p>
                {submitError && <div className="alert error">{submitError}</div>}
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={closeModal}>
                    Không
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(selectedSection)}
                  >
                    Có
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseSectionList;

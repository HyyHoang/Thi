import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../lib/store/redux/store';
import { fetchEnrollments, createEnrollment } from '../api';
import { fetchCourseSections } from '../../course-sections/courseSectionSlice';

const CourseRegistrationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: sections } = useSelector((state: RootState) => state.courseSections);
  const { enrollments, loading, error } = useSelector((state: RootState) => state.enrollments);
  
  const [user] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  
  const studentId = user?.student_id;

  useEffect(() => {
    dispatch(fetchCourseSections());
    dispatch(fetchEnrollments());
  }, [dispatch]);

  const handleRegister = async (sectionId: string) => {
    if (!studentId) return alert('Không tìm thấy ID sinh viên.');
    try {
      await dispatch(createEnrollment({ SectionID: sectionId, StudentID: studentId })).unwrap();
      alert('Đăng ký thành công!');
    } catch (err: any) {
      alert(err || 'Đăng ký thất bại.');
    }
  };

  const myEnrollments = enrollments; // API already filters for current student
  const registeredSectionIds = myEnrollments.map(e => e.SectionID);

  if (loading && enrollments.length === 0) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 underline decoration-blue-500 underline-offset-8">
        Đăng Ký Học Phần
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Part 1: Open Sections */}
      <section className="mb-10 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
          <span className="w-2 h-8 bg-blue-600 mr-3 rounded"></span>
          Lớp Học Phần Đang Mở
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Tên Lớp</th>
                <th className="border p-2 text-left">Môn Học</th>
                <th className="border p-2 text-left">Học Kỳ</th>
                <th className="border p-2 text-left">Giảng Viên</th>
                <th className="border p-2 text-center whitespace-nowrap">Sĩ Số</th>
                <th className="border p-2 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Hiện không có lớp học phần nào mở đăng ký.</td></tr>
              ) : (
                sections.map(section => {
                  const isRegistered = registeredSectionIds.includes(section.SectionID);
                  return (
                    <tr key={section.SectionID} className="hover:bg-blue-50 transition-colors">
                      <td className="border p-2 font-medium">{section.SectionName}</td>
                      <td className="border p-2 text-sm">{section.Subject?.SubjectName || '-'}</td>
                      <td className="border p-2 text-sm">{section.Semester?.SemesterName || '-'}</td>
                      <td className="border p-2 text-sm">{section.Teacher?.FullName || '-'}</td>
                      <td className="border p-2 text-center text-sm">{section.MaxStudent}</td>
                      <td className="border p-2 text-center">
                        <button
                          disabled={isRegistered}
                          onClick={() => handleRegister(section.SectionID)}
                          className={`px-4 py-1.5 rounded transition-all font-medium text-xs md:text-sm ${
                            isRegistered 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          {isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Part 2: Current Enrollments */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-emerald-800 flex items-center">
          <span className="w-2 h-8 bg-emerald-600 mr-3 rounded"></span>
          Kết Quả Đăng Ký Của Bạn
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Mã Đăng Ký</th>
                <th className="border p-2 text-left">Tên Lớp</th>
                <th className="border p-2 text-left">Môn Học</th>
                <th className="border p-2 text-left">Ngày Đăng Ký</th>
                <th className="border p-2 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {myEnrollments.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Bạn chưa thực hiện đăng ký nào.</td></tr>
              ) : (
                myEnrollments.map(e => (
                  <tr key={e.EnrollmentID}>
                    <td className="border p-2 font-mono text-xs">{e.EnrollmentID}</td>
                    <td className="border p-2">{e.course_section?.SectionName || '-'}</td>
                    <td className="border p-2 text-sm">{e.course_section?.Subject?.SubjectName || '-'}</td>
                    <td className="border p-2 text-sm">{new Date(e.EnrollDate).toLocaleDateString('vi-VN')}</td>
                    <td className="border p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        e.Status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {e.Status === 1 ? 'Thành công' : 'Đã hủy'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CourseRegistrationPage;

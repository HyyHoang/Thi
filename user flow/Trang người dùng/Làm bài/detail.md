II. User Flow Chi Tiết Từng Bước
1. Đăng nhập hệ thống
Người dùng truy cập hệ thống luyện thi IELTS.
Nhập thông tin:
•	Email / Username
•	Mật khẩu
Nhấn Đăng nhập
Hệ thống kiểm tra:
Trường hợp 1: Sai thông tin
→ Hiển thị thông báo lỗi
Email hoặc mật khẩu không đúng
→ Yêu cầu nhập lại

Trường hợp 2: Đúng thông tin
→ Chuyển đến Dashboard

2. Truy cập Dashboard
Tại Dashboard hệ thống hiển thị:
•	Tổng số bài đã làm
•	Band điểm trung bình
•	Bài thi gần nhất
•	Gợi ý bài luyện tập
Người dùng chọn mục:
👉 Luyện thi IELTS

3. Chọn hình thức làm bài
Hệ thống hiển thị 2 lựa chọn:
1️⃣ Full Test
Thi đầy đủ 4 kỹ năng:
•	Listening
•	Reading
•	Writing
•	Speaking

2️⃣ Practice by Skill
Thi riêng từng kỹ năng:
•	Listening Practice
•	Reading Practice
•	Writing Practice
•	Speaking Practice
Người dùng chọn một hình thức luyện thi.

4. Xem danh sách bộ đề
Hệ thống hiển thị danh sách bộ đề:

Thông tin hiển thị gồm:
•	Tên bộ đề
•	Loại đề
•	Số câu hỏi
•	Thời gian làm bài
•	Mức độ khó
Người dùng chọn một bộ đề

5. Xem thông tin chi tiết đề thi
Trang chi tiết đề hiển thị:
Thông tin gồm:
•	Tên đề thi
•	Loại đề (Academic / General)
•	Kỹ năng
•	Số câu hỏi
•	Thời gian làm bài
Ví dụ:
Reading Test
40 questions
Duration: 60 minutes
Người dùng nhấn:
👉 Bắt đầu làm bài

6. Khởi tạo bài thi
Sau khi người dùng nhấn Bắt đầu làm bài
Hệ thống thực hiện:
•	Tạo Attempt
•	Lưu user_id
•	Lưu test_id
•	Lưu started_at
•	Lưu trạng thái bài thi
Sau đó hệ thống:
•	Tải danh sách section
•	Tải danh sách câu hỏi
→ Hiển thị giao diện làm bài.

7. Làm bài thi
Giao diện hiển thị:
•	Nội dung câu hỏi
•	Các đáp án
•	Danh sách câu hỏi
•	Thời gian còn lại
Người dùng có thể:
•	Chọn đáp án
•	Thay đổi đáp án
•	Chuyển câu hỏi
•	Xem câu hỏi tiếp theo
Khi người dùng chọn đáp án:
→ Hệ thống tạm lưu câu trả lời

8. Trường hợp Listening
Đối với bài Listening
Hệ thống hiển thị:
•	Audio player
•	Nội dung câu hỏi
Quy tắc:
•	Người dùng chỉ được nghe tối đa 2 lần
•	Không được tua nhanh hoặc tua lại
Khi người dùng nhấn Play
Hệ thống:
audio_play_count + 1
Nếu:
audio_play_count > 2
→ Không cho phép phát audio.

9. Trường hợp Reading
Đối với bài Reading
Giao diện hiển thị:
•	Đoạn văn (Passage)
•	Danh sách câu hỏi
Người dùng:
•	Đọc đoạn văn
•	Chọn đáp án
•	Điền câu trả lời
Hệ thống tự động lưu câu trả lời tạm thời.

10. Trường hợp Writing
Đối với bài Writing
Hệ thống hiển thị:
•	Writing Task 1 / Task 2
•	Khung nhập bài viết
Người dùng:
•	Nhập nội dung bài viết
•	Hệ thống đếm số từ
Ví dụ:
Word count: 180
Khi người dùng nhập nội dung:
→ Hệ thống tự động lưu nháp

11. Trường hợp Speaking
Đối với bài Speaking
Hệ thống hiển thị:
•	Câu hỏi speaking
•	Nút ghi âm
Người dùng:
👉 Nhấn Start Recording
Hệ thống:
•	Thu âm câu trả lời
•	Lưu file audio
Sau khi hoàn thành:
→ Upload audio lên server.

12. Theo dõi thời gian làm bài
Trong suốt quá trình làm bài:
Hệ thống hiển thị:
⏱ Time remaining
Hệ thống thực hiện:
•	Đếm ngược thời gian
•	Cảnh báo khi gần hết giờ
Ví dụ:
5 minutes remaining

Trường hợp hết thời gian
→ Hệ thống tự động nộp bài

13. Nộp bài
Người dùng nhấn:
👉 Submit Test
Hệ thống hiển thị xác nhận:
Bạn có chắc muốn nộp bài?
Người dùng chọn:
Không → quay lại làm bài
Có → hệ thống nộp bài

14. Xử lý kết quả
Sau khi nộp bài:
Hệ thống xử lý:
Listening
•	So sánh đáp án
•	Tính số câu đúng

Reading
•	So sánh đáp án
•	Tính số câu đúng

Writing
Hệ thống:
•	Lưu bài viết
•	Gửi nội dung đến AI chấm điểm
AI trả về:
•	Estimated band score
•	Feedback

Speaking
Hệ thống:
•	Lưu audio
•	Chuyển audio → transcript
•	Gửi transcript đến AI
AI trả về:
•	Estimated band score
•	Feedback

15. Hiển thị kết quả
Hệ thống hiển thị:
Ví dụ:
Listening: 6.5
Reading: 7.0
Writing: Pending AI evaluation
Speaking: Pending AI evaluation
Sau khi AI chấm xong:
Writing: 6.5
Speaking: 6.0
Overall Band: 6.5

16. Lưu lịch sử bài thi
Hệ thống lưu:
•	thông tin bài thi
•	câu trả lời
•	band điểm
•	thời gian làm bài
Người dùng có thể xem tại:
👉 My Test History
Thông tin hiển thị:
Test	Date	Score
Reading Test 1	10/05	7.0
Listening Test 2	09/05	6.5

III. Các Trường Hợp Đặc Biệt
1. Refresh trang khi đang làm bài
Nếu người dùng refresh trang:
→ Hệ thống tải lại trạng thái bài thi.
Các câu trả lời đã lưu được khôi phục.

2. Mất kết nối mạng
Nếu mất kết nối:
•	Các câu trả lời đã lưu vẫn tồn tại
•	Khi kết nối lại → tiếp tục làm bài.

3. Người dùng thoát giữa chừng
Nếu user thoát:
•	attempt vẫn tồn tại
•	có thể quay lại tiếp tục làm bài.

4. Nộp bài rồi
Sau khi nộp bài:
→ Không được phép làm lại attempt đó.

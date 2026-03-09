II. User Flow Chi Tiết Từng Bước
Quản trị viên truy cập vào hệ thống quản trị và đăng nhập bằng tài khoản có quyền quản trị. Sau khi đăng nhập thành công, hệ thống hiển thị trang Dashboard quản trị với các chức năng quản lý dữ liệu của hệ thống.
-> Tại giao diện quản trị, quản trị viên chọn chức năng Quản lý câu hỏi. Hệ thống chuyển đến trang danh sách câu hỏi và thực hiện truy vấn dữ liệu từ bảng questions trong cơ sở dữ liệu để hiển thị danh sách các câu hỏi hiện có trong hệ thống.
-> Quản trị viên chọn một câu hỏi cụ thể để quản lý các chủ đề (Tag) liên quan đến câu hỏi đó. Hệ thống sẽ truy vấn dữ liệu từ bảng question_tags kết hợp với bảng tags để hiển thị danh sách các Tag chủ đề đã được gắn cho câu hỏi. Các Tag có thể là các chủ đề trong IELTS như Education, Environment, Technology, Health.
-> Tại trang này, quản trị viên có thể thực hiện các thao tác quản lý Tag cho câu hỏi như thêm Tag mới, chỉnh sửa Tag hoặc xóa Tag khỏi câu hỏi.

Trường hợp 1: Thêm Tag cho câu hỏi
- Khi muốn thêm một Tag chủ đề cho câu hỏi, quản trị viên nhấn vào nút Thêm Tag tại trang quản lý Tag của câu hỏi.
- Hệ thống hiển thị biểu mẫu cho phép quản trị viên lựa chọn Tag chủ đề từ danh sách các Tag đã tồn tại trong bảng tags. Ngoài ra, quản trị viên có thể xem thông tin mô tả của Tag để đảm bảo lựa chọn đúng chủ đề phù hợp với nội dung câu hỏi.
-> Sau khi chọn Tag phù hợp, quản trị viên nhấn Lưu để gửi dữ liệu lên hệ thống.
- Hệ thống tiến hành kiểm tra dữ liệu để đảm bảo rằng Tag chưa được gán cho câu hỏi trước đó và thông tin nhập vào là hợp lệ. Nếu dữ liệu không hợp lệ, hệ thống sẽ hiển thị thông báo lỗi và yêu cầu quản trị viên thực hiện lại thao tác.
-> Nếu dữ liệu hợp lệ, hệ thống sẽ lưu mối quan hệ giữa câu hỏi và Tag vào bảng question_tags trong cơ sở dữ liệu.
- Sau khi lưu thành công, hệ thống hiển thị thông báo thêm Tag thành công và cập nhật lại danh sách Tag của câu hỏi trên giao diện quản trị.

Trường hợp 2: Chỉnh sửa Tag
- Trong danh sách các Tag đã gắn với câu hỏi, quản trị viên có thể chọn chức năng Sửa tại một Tag cụ thể.
- Khi chức năng chỉnh sửa được chọn, hệ thống hiển thị biểu mẫu chỉnh sửa với các thông tin hiện tại của Tag, bao gồm tên Tag và mô tả Tag.
-> Quản trị viên có thể chỉnh sửa các thông tin này để phù hợp hơn với nội dung câu hỏi hoặc cập nhật lại mô tả chủ đề.
-> Sau khi hoàn tất chỉnh sửa, quản trị viên nhấn Cập nhật để lưu thay đổi. Hệ thống kiểm tra tính hợp lệ của dữ liệu nhập vào. Nếu dữ liệu hợp lệ, hệ thống tiến hành cập nhật thông tin Tag trong bảng tags của cơ sở dữ liệu.
-> Sau khi cập nhật thành công, hệ thống hiển thị thông báo cập nhật Tag thành công và làm mới danh sách Tag trên giao diện quản trị.

Trường hợp 3: Xóa Tag khỏi câu hỏi
- Trong trường hợp quản trị viên muốn loại bỏ một Tag khỏi câu hỏi, quản trị viên chọn chức năng Xóa tại Tag cần xóa.
-> Khi thao tác xóa được thực hiện, hệ thống hiển thị hộp thoại xác nhận để đảm bảo rằng quản trị viên thực sự muốn xóa Tag này khỏi câu hỏi.
- Sau khi quản trị viên xác nhận xóa -> hệ thống tiến hành xóa dữ liệu liên kết giữa câu hỏi và Tag trong bảng question_tags của cơ sở dữ liệu.
- Sau khi xóa thành công -> hệ thống hiển thị thông báo xóa Tag thành công và cập nhật lại danh sách Tag của câu hỏi trên giao diện quản trị.

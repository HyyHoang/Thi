II. User Flow Chi Tiết Từng Bước
Truy cập chức năng quản lý đáp án:
Quản trị viên truy cập vào hệ thống quản trị và đăng nhập bằng tài khoản có quyền quản trị. Sau khi đăng nhập thành công, hệ thống hiển thị trang Dashboard quản trị với các chức năng quản lý dữ liệu của hệ thống.
Tại giao diện quản trị, quản trị viên chọn chức năng Quản lý câu hỏi. Hệ thống chuyển đến trang danh sách câu hỏi và thực hiện truy vấn dữ liệu từ bảng questions trong cơ sở dữ liệu để hiển thị danh sách các câu hỏi hiện có.
Quản trị viên chọn một câu hỏi cụ thể để quản lý các đáp án của câu hỏi đó. Hệ thống sẽ truy vấn dữ liệu từ bảng question_options và hiển thị danh sách các đáp án tương ứng với câu hỏi đã chọn. Tại trang này, quản trị viên có thể thực hiện các thao tác quản lý đáp án như thêm đáp án mới, chỉnh sửa đáp án hoặc xóa đáp án.
**Trường hợp 1: Thêm đáp án**
Khi muốn thêm một đáp án mới cho câu hỏi, quản trị viên nhấn vào nút Thêm đáp án tại trang quản lý đáp án.
Hệ thống hiển thị biểu mẫu nhập thông tin đáp án. Các thông tin cần nhập bao gồm:
Nội dung đáp án -> Nhãn đáp án (A, B, C, D)-> Đánh dấu đáp án đúng nếu đó là đáp án chính xác
-> Sau khi nhập đầy đủ thông tin, quản trị viên nhấn Lưu để gửi dữ liệu lên hệ thống.
-> Hệ thống sẽ tiến hành kiểm tra tính hợp lệ của dữ liệu nhập vào -> Nếu dữ liệu không hợp lệ, hệ thống hiển thị thông báo lỗi và yêu cầu quản trị viên nhập lại thông tin.
-> Nếu dữ liệu hợp lệ, hệ thống sẽ lưu thông tin đáp án vào bảng question_options trong cơ sở dữ liệu.
Sau khi lưu thành công, hệ thống hiển thị thông báo thêm đáp án thành công và cập nhật lại danh sách đáp án của câu hỏi.
**Trường hợp 2: Chỉnh sửa đáp án**
Tại danh sách đáp án của câu hỏi, quản trị viên có thể chọn chức năng Sửa tại một đáp án cụ thể.
Khi chức năng chỉnh sửa được chọn, hệ thống hiển thị biểu mẫu chỉnh sửa với thông tin hiện tại của đáp án.
Quản trị viên có thể thay đổi các thông tin như:
- Nội dung đáp án
- Nhãn đáp án
- Trạng thái đáp án đúng
-> Sau khi hoàn tất chỉnh sửa, quản trị viên nhấn Cập nhật để lưu thay đổi.
-> Hệ thống tiến hành kiểm tra tính hợp lệ của dữ liệu. Nếu dữ liệu hợp lệ, hệ thống cập nhật thông tin mới vào bảng question_options trong cơ sở dữ liệu.
-> Sau khi cập nhật thành công, hệ thống hiển thị thông báo cập nhật đáp án thành công và làm mới danh sách đáp án trên giao diện quản trị.
**Trường hợp 3: Xóa đáp án**
- Tại danh sách đáp án của câu hỏi, quản trị viên có thể chọn chức năng Xóa tại một đáp án không còn cần thiết.
- Khi thao tác xóa được thực hiện, hệ thống hiển thị hộp thoại xác nhận để đảm bảo quản trị viên thực sự muốn xóa đáp án này.
- Sau khi quản trị viên xác nhận xóa, hệ thống tiến hành xóa dữ liệu của đáp án khỏi bảng question_options trong cơ sở dữ liệu.
- Sau khi xóa thành công, hệ thống hiển thị thông báo xóa đáp án thành công và cập nhật lại danh sách đáp án của câu hỏi trên giao diện.

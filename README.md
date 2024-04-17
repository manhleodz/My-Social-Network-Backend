This is a project I am very passionate about. This is the backend of the My Social Network web project. The idea started from Facebook and I wanted to create a social network for people to interact with each other and be able to share photos and videos. I also want to create an additional section so users can share their favorite music tastes. Because I love music very much and music is a wonderful way to connect between people.

The project is still in the initial stages, I hope to complete the project as best as possible

##Tech:  
- Nodejs, ExpressJs, sequelize, socket.io
- DB: postgreSQL, redis
- Storage: firebase

# Đăng nhập, đăng ký
- Người dùng đăng ký bằng gmail và mật khẩu. Sau khi data được gửi lên phía server sẽ có validate, nếu đúng mã OTP sẽ gửi đến mail của người dùng.
- Nhập OTP thành công, tài khoản sẽ được tạo nhưng chưa active. Người dùng cần confirm thêm thông tin, thành công tài khoản sẽ được active và tham gia vào trang web
# Bài viết
- Người dùng có thể tạo bài viết vs caption, hình ảnh, video với số lượng nhỏ hơn 5. Sử dụng phương thức POST, có sử dụng middelware để kiểm tra phần hình ảnh và video đăng lên không có dung lượng quá 5mb. Nếu thành công, bài post sẽ được tạo. Nếu chỉ có caption thì sẽ trả về thông tin bài post mới, Nếu có hình ảnh, video thì chúng sẽ được tải lên firebase-storage xong lấy về danh sách link rồi insert vào bảng xong mới trả về bài post mới. Nếu gặp lỗi trong quá trình này, bài post được tạo kia sẽ bị xóa.
- Có thể chỉnh sửa, xóa bài viết.
# Story
- Có thể tạo story bằng hình ảnh hoặc video (cũng có middleware để validate). Với hình ảnh phía server có tính toán màu trung bình để làm màu nền của story
- Có thể xóa tin của mình
- Story hết hạn thì sẽ chỉ có người dùng sở tạo chúng có thể xem lại được
# Trang cá nhân
- Người dùng có thể chỉnh sửa thông tin, xem trang cá nhân của người dùng khác, sẽ chỉ thấy bài viết public của người dùng khác.
# Bạn bè
- Có thể gửi lời mời kết bạn với người dùng khác và chờ đợi họ phản hồi(Có gửi thông báo), tương tự bạn có thể chấp nhận lời mời được gửi đến mình.
# Chat
- Người dùng có thể nhắn tin khi là bạn bè, nếu chưa kb tin nhắn sẽ ở trong tin nhắn chờ.
- Có thể gửi cả icon, emoji, gif, hình ảnh, video(xác định bời cột Type)
- Có thể xóa hoặc chỉnh sửa tin nhắn của mình (có bước xác nhận danh tính để ko thể xóa tin nhắn người khác)
- Có thể tạo nhóm chat, thêm thành viên, thay đổi thông tin nhóm chat, người dùng trong nhóm chat

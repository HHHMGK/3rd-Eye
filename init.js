(function () {
    let clickCount = 0; // Biến đếm số lần click

    function createFloatingButton() {
        const button = document.createElement('button');
        button.className = 'floating-button';
        button.id = 'floating-mm-btn';// Thêm text vào nút để dễ nhận diện
        document.body.appendChild(button);
    }

    function attachButtonEvent() {
        // Lấy nút vừa tạo bằng ID
        const btn = document.getElementById("floating-mm-btn");
        // Gắn sự kiện onclick
        btn.addEventListener("click", function () {
            if (clickCount === 2) {
                // Nếu click lần thứ 3, quay lại trang trước đó
                window.history.back();
                clickCount = 0; // Đặt lại biến đếm
                return; // Kết thúc hàm
            }

            // Xác định cách gọi API dựa trên số lần click
            const url = "http://localhost:5000/process";
            const runtype = clickCount === 0 
                ? "summarize" 
                : "full";

            // Dữ liệu gửi đi trong trường hợp POST
            const requestData = { 
                'article_url': window.location.href,
                'runtype': runtype
            };
            console.log("Request to send to API:", requestData);

            // Gửi yêu cầu đến API mà không đợi phản hồi
            fetch(url, {
                method: "POST", // Phương thức POST
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error("API request failed with status:", response.status);
                }
            }).then(data => {
                if (data) {
                    console.log("Response from API:", data);
                }
            }).catch(error => {
                console.error("Error while calling API:", error);
            });

            // Tăng biến đếm sau mỗi lần click
            clickCount++;
            console.log("Click count:", clickCount);
        });
    }

    // Gọi các hàm đã định nghĩa
    createFloatingButton();
    attachButtonEvent();
})();

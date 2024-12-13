(function () {
    let clickCount = 0; // Biến đếm số lần click
    let hasNavigatedBack = false; // Biến kiểm tra nếu người dùng đã quay lại trang trước
    let abortController = null; // Biến để lưu AbortController

    function createFloatingButton() {
        const button = document.createElement('button');
        button.className = 'floating-button';
        button.id = 'floating-mm-btn';
        document.body.appendChild(button);
    }

    function attachButtonEvent() {
        // Lấy nút vừa tạo bằng ID
        const btn = document.getElementById("floating-mm-btn");
        // Gắn sự kiện onclick
        btn.addEventListener("click", function () {
            if (hasNavigatedBack) {
                console.log("User has navigated back, stopping further API calls.");
                return; // Nếu người dùng đã quay lại trang trước, không thực hiện các bước tiếp theo
            }

            if (clickCount === 2) {
                // Nếu click lần thứ 3, quay lại trang trước và hủy các API đang chờ
                if (abortController) {
                    abortController.abort(); // Hủy bỏ yêu cầu API đang chờ
                    console.log("Aborted pending API requests.");
                }
                window.history.back(); // Quay lại trang trước
                hasNavigatedBack = true; // Đánh dấu là đã quay lại trang trước
                clickCount = 0; // Đặt lại biến đếm
                return; // Kết thúc hàm
            }

            (async function() {
                try {
                    // Tạo AbortController để có thể hủy yêu cầu sau này
                    abortController = new AbortController();
                    const signal = abortController.signal; // Lấy tín hiệu hủy

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
                    // Gửi yêu cầu đến API với tín hiệu hủy
                    const response = await fetch(url, {
                        method: "POST", // Phương thức POST
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestData),
                        signal: signal // Đính kèm tín hiệu hủy vào yêu cầu
                    });

                    // Kiểm tra kết quả
                    if (response.ok) {
                        const data = await response.json(); // Parse JSON nếu cần
                        console.log("Response from API:", data);
                    } else {
                        console.error("API request failed with status:", response.status);
                    }
                } catch (error) {
                    // Kiểm tra lỗi nếu yêu cầu bị hủy hoặc có lỗi khác
                    if (error.name === 'AbortError') {
                        console.log("API request was aborted.");
                    } else {
                        console.error("Error while calling API:", error);
                    }
                }
            })();
        
            // Tăng biến đếm sau mỗi lần click
            clickCount++;
            console.log(clickCount)
        });
    }

    // Gọi các hàm đã định nghĩa
    createFloatingButton();
    attachButtonEvent();
})();


function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function handleFileChange(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileName = file.name; // Lấy tên file
        const allowedExtensions = ['xlsx', 'xls'];
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            alert('Vui lòng chọn file Excel (xlsx, xls)!');
            return;
        }

        const msgHTML = `
            <div class="msg-container">
                <div class="msg right-msg">
                    <div class="file-box">
                        <img src="static/image/sheets.png" alt="file">
                        <div>
                            <div class="file-name">${fileName}</div> <!-- Hiển thị tên file thực tế -->
                            <div class="file-type">Bảng tính</div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);

        // Gọi hàm upload file nếu file hợp lệ
        uploadExcel(file);
    }
}

async function uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch("/upload-template", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken
            },
            body: formData
        });
        const result = await response.json();
        text = result.test_cases;
        
        if (!response.ok) {
            let errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message; // Lấy lỗi cụ thể từ server
                }
            } catch (jsonError) {
                console.error("Không thể đọc lỗi JSON:", jsonError);
            }
            alert(errorMessage); // Hiển thị lỗi bằng alert
            return;
        }
        
        msgHTML = `
            <div class="msg-container">
                <div class="msg left-msg">
                    <div class="file-box">
                        <img src="static/image/sheets.png" alt="file">
                        <div>
                            <div class="file-name">spec.xlsx</div>
                            <div class="file-type">Bảng tính</div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.getElementById("responses").insertAdjacentHTML("beforeend", msgHTML);
    } catch (error) {
        console.error('Error:', error);
        alert(error);
    }
}

// async function saveResponse(screen_name, requirement, result) {
//     const chatItem = {
//         screen_name: screen_name.trim(),
//         requirement: requirement.trim(),
//         result: result.trim()
//     };

//     try {
//         const saveResponse = await fetch("/save-upload/", {  
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRFToken": csrfToken
//             },
//             body: JSON.stringify({ 
//                 history_id: historyId, // Send historyId if it exists
//                 chat: chatItem
//             })
//         });

//         if (saveResponse.ok) {
//             const responseData = await saveResponse.json();
//             historyId = responseData.history_id;
//             fetchHistoryList();
//         } else {
//             alert("Lưu thất bại. Hãy thử lại.");
//         }
//     } catch (error) {
//         console.error("Lỗi khi lưu:", error);
//         alert("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
//     } finally {
//         loading.classList.add("d-none");
//     }
// }

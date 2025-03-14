async function createTemplate() {
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    const loading = document.getElementById("loading");

    if (!screen_name || !requirement) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    loading.classList.remove("d-none");

    let randomId = uuidv4();
    document.getElementById("screen_name").value = "";
    document.getElementById("requirement").value = "";

    appendMessage("right", requirement, screen_name, randomId);
    try {
        const response = await fetch("generate-template", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ screen_name: screen_name, requirement: requirement })
        });
        loading.classList.add("d-none");
        if (response.ok) {
            const result = await response.json();
            appendTemplate("left", result.spec_data, result.screen_name, randomId);
            console.log(result.spec_data);
            // saveResponse(screen_name, requirement, result.spec_data, );
        } else {
            if (response.status === 500) {
                console.error("❌ Lỗi 500: Internal Server Error");
                appendTemplate("left", "Hệ thống gặp lỗi nội bộ. Vui lòng thử lại sau.", "System", randomId);
            } else {
                console.error(`❌ Lỗi ${response.status}: ${response.statusText}`);
                appendTemplate("left", `Lỗi ${response.status}: ${response.statusText}`, "System", randomId);
            }
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra trong quá trình gửi dữ liệu.");
    } finally {
        loading.classList.add("d-none");
    }
}

async function appendTemplate(side, text, screen_name, id) {
    const responsesContainer = document.getElementById("responses");
    let lastRightId = `msg-container-${id}`;

    if (side === "right") {
        // Hiển thị tin nhắn người dùng
        let msgHTML = `
            <div id="${lastRightId}" class="msg-container">
                ${rightHTML(new Date(), id, text, screen_name)}
            </div> 
        `;
        responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
    } else if (isValidJSON(text)) {
        // Kiểm tra JSON và hiển thị bảng
        const container = document.getElementById(lastRightId);
        if (typeof text === "string") {
            try {
                text = JSON.parse(text);
                console.log("✅ JSON đã được parse:", text);
            } catch (error) {
                console.error("❌ Lỗi parse JSON:", error);
            }
        }

        if (container) {
            let msgHTML = `
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${screen_name}</div>
                            <div class="msg-info-time">${new Date().toLocaleTimeString()}</div>
                        </div>
                        ${tableHTML(id)}
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn btn-success" onclick="exportExcel('${id}','${screen_name}')">Tải Excel</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);

            // Hiển thị dữ liệu bảng Spec
            displaySpecData(id, text.spec_data);
            // Hiển thị dữ liệu bảng API
            displayApiData(id, text.api_data);
        } else {
            console.error(`Container với id "${lastRightId}" không tìm thấy.`);
        }
    } else {
        // Hiển thị tin nhắn bot
        const container = document.getElementById(lastRightId);
        if (container) {
            let msgHTML = `
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">bot</div>
                            <div class="msg-info-time">${formatDate(new Date())}</div>
                        </div>
                        <div class="msg-text" id="${id}-bot"></div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);
            document.getElementById(`${id}-bot`).innerText = text;
        } else {
            console.error(`Container với id "${lastRightId}" không tìm thấy.`);
        }
    }

    responsesContainer.scrollTop = responsesContainer.scrollHeight;
}

// Kiểm tra JSON hợp lệ
function isValidJSON(text) {
    try {
        const json = JSON.parse(text);
        return typeof json === "object" && json !== null;
    } catch (error) {
        return false;
    }
}

// Hiển thị bảng Spec
function displaySpecData(id, data) {
    const tableBody = document.getElementById(`spec-table-body-${id}`);
    tableBody.innerHTML = "";

    let index = 0;
    function addRow() {
        if (index < data.length) {
            const row = data[index];

            let tr = document.createElement("tr");
            tr.innerHTML = "<td></td>".repeat(8); // 8 cột

            tableBody.appendChild(tr);

            const cells = tr.querySelectorAll("td");
            const values = [
                row["STT"], row["Tên Item"], row["Require"], row["Type"],
                row["Max"], row["Min"], row["Condition/Spec/Event"], row["Data"]
            ];
            cells.forEach((cell, i) => {
                typeText(cell, values[i]);
            });

            index++;
            setTimeout(addRow, 500);
        }
    }
    addRow();
}

// Hiển thị bảng API
function displayApiData(id, data) {
    const tableBody = document.getElementById(`api-table-body-${id}`);
    tableBody.innerHTML = "";

    let index = 0;
    function addRow() {
        if (index < data.length) {
            const row = data[index];

            let tr = document.createElement("tr");
            tr.innerHTML = "<td></td>".repeat(5); // 5 cột

            tableBody.appendChild(tr);

            const cells = tr.querySelectorAll("td");
            const values = [
                row["Loại"], row["Tên Tham số"], row["Bắt buộc"], row["Mô tả"], row["Mẫu"]
            ];
            cells.forEach((cell, i) => {
                typeText(cell, values[i]);
            });

            index++;
            setTimeout(addRow, 500);
        }
    }
    addRow();
}

// Hiệu ứng gõ chữ
function typeText(element, text, speed = 50) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

// Tạo HTML bảng Spec và API
function tableHTML(id) {
    return `
    <div class="msg-text">
        <h5>Spec Table</h5>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên Item</th>
                    <th>Require</th>
                    <th>Type</th>
                    <th>Max</th>
                    <th>Min</th>
                    <th>Condition/Spec/Event</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody id="spec-table-body-${id}"></tbody>
        </table>

        <h5>API Table</h5>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Loại</th>
                    <th>Tên Tham số</th>
                    <th>Bắt buộc</th>
                    <th>Mô tả</th>
                    <th>Mẫu</th>
                </tr>
            </thead>
            <tbody id="api-table-body-${id}"></tbody>
        </table>
    </div>`;
}

// Hiển thị tin nhắn người dùng
function rightHTML(created_at, id, requirement, screen_name) {
    return `<div class="msg right-msg">
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">user</div>
                <div class="msg-info-time">${formatDate(created_at)}</div>
            </div>
            <div class="msg-text" id="${id}">
                <strong>Màn hình chức năng:</strong> ${screen_name}<br>
                <strong>Yêu cầu:</strong> ${requirement}
            </div>
        </div>
    </div>`;
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date); // Convert string or number to Date
    }

    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}

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
            console.log(result);

            const randomId = Date.now();

            // Hiển thị bảng Spec
            appendTemplate("left", result.test_cases.spec_data, result.screen_name, randomId);

            // 👉 Gọi hàm để điền dữ liệu vào bảng
            displaySpecData(randomId, result.test_cases.spec_data);
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

async function appendTemplate(side, data, screen_name, id) {
    const responsesContainer = document.getElementById("responses");
    let lastRightId = `msg-container-${id}`;

    if (side === "left" && data) {
        const container = document.createElement("div");
        container.id = lastRightId;
        container.classList.add("msg-container");

        // Thêm HTML vào container
        container.innerHTML = `
            <div class="msg left-msg">
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${screen_name}</div>
                        <div class="msg-info-time">${formatDate(new Date())}</div>
                    </div>
                    ${tableHTML(id)}
                    <div class="d-flex justify-content-end mt-2">
                        <button class="btn btn-success" onclick="exportExcel('${id}','${screen_name}')">Tải Excel</button>
                    </div>
                </div>
            </div>
        `;

        responsesContainer.appendChild(container);

        // Hiển thị dữ liệu Spec
        displaySpecData(id, data.spec_data || []);
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

    data.forEach((row) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row["STT"] || ""}</td>
            <td>${row["Tên Item"] || ""}</td>
            <td>${row["Require"] || ""}</td>
            <td>${row["Type"] || ""}</td>
            <td>${row["Max"] || ""}</td>
            <td>${row["Min"] || ""}</td>
            <td>${row["Condition/Spec/Event"] || ""}</td>
            <td>${row["Data"] || ""}</td>
        `;
        tableBody.appendChild(tr);
    });
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

// Tạo HTML bảng Spec
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
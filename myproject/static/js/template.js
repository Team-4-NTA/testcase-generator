async function createTemplate() {
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    const loading = document.getElementById("loading");
    const selectedCheckbox = document.querySelector('.checkbox-group .form-check-input:checked');
    const selectedValue = selectedCheckbox ? selectedCheckbox.id : null;   

    if (!screen_name || !selectedValue) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    loading.classList.remove("d-none");

    let randomId = uuidv4();
    document.getElementById("screen_name").value = "";
    document.getElementById("requirement").value = "";

    document.querySelectorAll('.checkbox-group .form-check-input').forEach(checkbox => {
        checkbox.checked = false;
    });
    appendTemplate("right", requirement, screen_name, randomId, selectedValue);
    try {
        const response = await fetch("generate-template", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ screen_name: screen_name, requirement: requirement, type: selectedValue, history_id: window.historyId })
        });

        loading.classList.add("d-none");

        if (response.ok) {
            const result = await response.json();

            const randomId = Date.now();

            // Hiển thị bảng Spec
            appendTemplate("left", result, result.screen_name, randomId);
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

async function appendTemplate(side, data, screen_name, id, type = null) {
    const responsesContainer = document.getElementById("responses");
    let lastRightId = `msg-container-${id}`;

    if (side === "left" && data) {
        const container = document.createElement("div");
        container.id = lastRightId;
        container.classList.add("msg-container");

        container.innerHTML = `
            <div class="msg left-msg">
                <div class="file-box">
                    <img src="static/image/sheets.png" alt="file">
                    <div>
                        <div class="file-name">${data.file_name}</div>
                        <div class="d-flex justify-content-between">
                            <div class="file-type">Bảng tính</div>
                            <div class="download-link">
                                <a href="${data.file_url}" download>
                                    <i class="fas fa-download"></i> Download
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        responsesContainer.appendChild(container);
    } else {
        const container = document.createElement("div");
        container.id = lastRightId;
        container.classList.add("msg-container");

        container.innerHTML =`
            <div class="msg right-msg">
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">user</div>
                        <div class="msg-info-time">${formatDate(new Date())}</div>
                    </div>
                    <div class="msg-text" id="${id}">
                        <strong>Màn hình chức năng:</strong> ${screen_name}<br>
                        <strong>Yêu cầu:</strong> ${data}<br>
                        <strong>Loại:</strong> ${type}
                    </div>
                </div>
            </div>
        `;
        responsesContainer.appendChild(container);
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

function renderMetaList(meta) {
    let html = `<ul class="list-group">`;
    for (const [key, value] of Object.entries(meta)) {
        html += `<li class="list-group-item"><strong>${key}:</strong> ${value}</li>`;
    }
    html += `</ul>`;
    return html;
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}

async function exportExcel(id, screen_name) {
    const testCase = document.getElementById(`${id}-bot`).innerText;

    try {
        const response = await fetch("/export-template", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ testCase: testCase, screenName: screen_name })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${screen_name}_testcase.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            alert("Có lỗi xảy ra khi export: " + errorData.error);
        }
    } catch (error) {
        console.error("Error export:", error);
        alert("Có lỗi xảy ra khi export");
    }
}
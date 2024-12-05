const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
let historyId = null;
let chatIDs = [];

document.getElementById('toggleSidebar').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    var mainContent = document.querySelector('main');
    if (sidebar.classList.contains('collapsed')) {
        mainContent.style.width = '100%';
    } else {
        if (window.innerWidth > 1200) { 
            mainContent.style.width = '80%';
        } else {
            mainContent.style.width = '70%';
        } 
    }
});

document.getElementById("saveButton").addEventListener("click", async function() {
    const responsesContainer = document.getElementById("responses");
    const messageContainers = responsesContainer.querySelectorAll(".msg-container"); // Get all paired messages
    const botMessages = responsesContainer.querySelectorAll(".msg-text[data-loading='true']")
    const chatItems = [];
    if (botMessages.length > 0) {
        alert("Vui lòng đợi phản hồi bot hoàn tất trước khi lưu!");
        return;
    }
    const filteredContainers = Array.from(messageContainers).filter(container => {
        const chatId = container.id.split('-')[2]; 

        if (!chatId || chatId.trim() === "") {
            console.warn("Invalid chatId:", chatId);
            return false; 
        }

        if (!chatIDs.includes(chatId)) {
            chatIDs.push(chatId);
            console.log("Added chatId to chatIDs:", chatId);
            return true;
        }

        return false;
    });

    filteredContainers.forEach(container => {
        const userMsg = container.querySelector(".right-msg .msg-text");
        const botMsg = container.querySelector(".left-msg .msg-text");

        if (userMsg && botMsg) {
            try {
                const messageParts = userMsg.innerHTML.split('###### ');
                chatItems.push({
                    screen_name: messageParts[1].replace('Màn hình chức năng: ', '').trim(),
                    requirement: messageParts[2].replace('Yêu cầu: ', '').trim(),
                    result: botMsg.innerText.trim()
                });
            } catch (error) {
                console.error("Error processing message container:", error, container);
            }
        } else {
            console.warn("Missing user or bot message in container:", container);
        }
    });

    if (chatItems.length === 0) {
        alert("Không có lịch sử nào để lưu!");
        return;
    }

    try {
        const saveResponse = await fetch("/save-history/", {  
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ 
                history_id: historyId, // Send historyId if it exists
                chats: chatItems
            })
        });

        if (saveResponse.ok) {
            const responseData = await saveResponse.json();
            alert(`Lưu lịch sử thành công! ID: ${responseData.history_id}`);
            historyId = responseData.history_id;
            fetchHistoryList();
        } else {
            alert("Lưu thất bại. Hãy thử lại.");
        }
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
    } finally {
        loading.classList.add("d-none");
    }
});

function addNewItem() {
    document.getElementById("responses").replaceChildren();
    historyId = null;
    chatIDs = [];
    fetchHistoryList();
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

async function submitForm() {
    const screen_name = document.getElementById("screen_name").value;
    const requirement = document.getElementById("requirement").value;
    const loading = document.getElementById("loading");

    if (!screen_name || !requirement) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    loading.classList.remove("d-none");

    const text = `###### Màn hình chức năng: ${screen_name}\n###### Yêu cầu: ${requirement}`;
    let randomId = uuidv4();
    document.getElementById("screen_name").value = "";
    document.getElementById("requirement").value = "";

    appendMessage("user", "right", text, screen_name, randomId);
    try {
        const response = await fetch("", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ screen_name: screen_name, requirement: requirement })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let result = '';

        appendMessage("bot", "left", result, screen_name, randomId);
        const msgTextDiv = document.getElementById(`${randomId}-bot`);
        msgTextDiv.setAttribute("data-loading", "true");
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            result += decoder.decode(value, { stream: true });
            msgTextDiv.innerText = result;
        }
        msgTextDiv.setAttribute("data-loading", "false");
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra trong quá trình gửi dữ liệu.");
    } finally {
        loading.classList.add("d-none"); 
    }
}

async function fetchHistoryList() {
    const sidebarList = document.getElementById("sidebar-list");
    sidebarList.innerHTML = "";

    try {
        const response = await fetch("/get-history/");
        const histories = await response.json();

        histories.forEach(history => {
            const listItem = document.createElement("li");
            listItem.className = "nav-item";
            listItem.innerHTML = `<a class="nav-link" href="#" onclick="loadChats(${history.id})">${history.name}</a>`;
            listItem.innerHTML = `
                <div id="history-${history.id}" 
                    class="history-item d-flex justify-content-between align-items-center px-3" 
                    onclick="loadChats(${history.id})", style="padding: 8px;">
                    <p class="mb-0 text-left flex-grow-1">${history.name}</p>
                    <button class="btn btn-danger btn-sm ms-2" onclick="deleteHistory(${history.id}, event)">Xóa</button>
                </div>
            `;
            sidebarList.appendChild(listItem);
            if (historyId === history.id) {
                listItem.style.background = "gray";
            }
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhật ký:", error);
    }
}

async function loadChats(id) {
    chatIDs = []
    historyId = id;
    fetchHistoryList();
    try {
        const response = await fetch(`/get-chat-list/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            }
        });

        if (response.ok) {
            const chats = await response.json();
            historyId = id;
            displayChats(chats);
        } else {
            alert("Không thể tải lịch sử trò chuyện.");
        }
    } catch (error) {
        console.error("Error fetching chat history:", error);
        alert("Có lỗi xảy ra khi tải lịch sử.");
    }
}

function displayChats(chats) {
    const responsesContainer = document.getElementById("responses"); 

    responsesContainer.innerHTML = '';

    chats.forEach(chat => {
        chatIDs.push(chat.id);
        const msgHTML = `
            <div id="msg-container-${chat.id}" class="msg-container">
                <div class="msg right-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">user</div>
                            <div class="msg-info-time">${formatDate(chat.created_at)}</div>
                        </div>
                        <div class="msg-text" id="${chat.id}">###### Màn hình chức năng: ${chat.screen_name}<br>###### Yêu cầu: ${chat.requirement}</div>
                    </div>
                </div>
                <div class="msg left-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">bot</div>
                            <div class="msg-info-time">${formatDate(chat.created_at)}</div>
                        </div>
                        <div class="msg-text" id="${chat.id}-bot"></div>
                        <button class="btn btn-success mt-2 float-right" onclick="exportExcel('${chat.id}','${chat.screen_name}')">Export Excel</button>
                    </div>
                </div>
            </div> 
        `;
        responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
        const msgTextDiv = document.getElementById(`${chat.id}-bot`);
        msgTextDiv.innerText = chat.result;
        responsesContainer.scrollTop = responsesContainer.scrollHeight;
    });
}

function appendMessage(name, side, text, screen_name, id) {
    const responsesContainer = document.getElementById("responses");
    lastRightId = `msg-container-${id}`;
    if (side === "right") {
        msgHTML = `
            <div id="${lastRightId}" class="msg-container">
                <div class="msg ${side}-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${name}</div>
                            <div class="msg-info-time">${formatDate(new Date())}</div>
                        </div>
                        <div class="msg-text" id="${id}"></div>
                    </div>
                </div>
            </div> 
        `;
        responsesContainer.insertAdjacentHTML("beforeend", msgHTML);
        const msgTextDiv = document.getElementById(id);
        msgTextDiv.innerText = text;
    } else {
        const container = document.getElementById(lastRightId);
        console.log(lastRightId);
        let idText = `${id}`;
        if (container) {
            msgHTML = `
                <div class="msg ${side}-msg">
                    <div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${name}</div>
                            <div class="msg-info-time">${formatDate(new Date())}</div>
                        </div>
                        <div class="msg-text" id="${id}-bot"></div>
                        <button class="btn btn-success mt-2 float-right" onclick="exportExcel('${idText}','${screen_name}')">Export Excel</button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", msgHTML);
        } else {
            console.error(`Container with id "${lastRightId}" not found for bot message.`);
        }
    }
    responsesContainer.scrollTop = responsesContainer.scrollHeight;
}

async function deleteHistory(history_id, event) {
    event.stopPropagation();
    try {
        const response = await fetch(`/delete-history/${history_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            console.log(`History with ID ${history_id} deleted successfully.`);
            alert("xóa lịch sử thành công");
            fetchHistoryList();
            addNewItem();
        } else {
            alert("Lỗi khi xóa lịch sử.");
        }
    } catch (error) {
        console.error("Lỗi khi xóa lịch sử:", error);
    }
}

async function exportExcel(id, screen_name) {
    const testCase = document.getElementById(`${id}-bot`).innerText;

    try {
        const response = await fetch("/export-excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ testCase: testCase, screenName: screen_name })
        });

        if (response.ok) {
            // Tạo link tải xuống
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

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date); // Convert string or number to Date
    }

    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
}

window.onload = function () {
    fetchHistoryList();
};
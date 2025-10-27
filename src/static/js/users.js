async function addUser(event) {
    event.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const photo = document.getElementById("photo").files[0];

    // Cấu hình validate cho từng trường
    const fields = [
        {
            id: "firstname",
            name: "First name",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Chỉ chứa chữ và khoảng trắng, 2–50 ký tự"
        },
        {
            id: "lastname",
            name: "Last name",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Chỉ chứa chữ và khoảng trắng, 2–50 ký tự"
        },
        {
            id: "username",
            name: "Username",
            required: true,
            pattern: /^[a-zA-Z0-9_]{3,20}$/,
            patternMsg: "Chỉ chứa chữ, số, _ và từ 3–20 ký tự"
        },
        {
            id: "email",
            name: "Email",
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: "Email không hợp lệ"
        },
        {
            id: "password",
            name: "Password",
            required: true,
            minLength: 8,
            minLengthMsg: "Mật khẩu phải ít nhất 8 ký tự",
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/,
            patternMsg: "Phải có chữ hoa, chữ thường, số, ký tự đặc biệt và không có khoảng trắng"
        }
    ];

    // Reset lỗi
    fields.forEach(f => {
        const el = document.getElementById(`error-add-${f.id}`);
        el.innerText = "";
        el.classList.add("hidden");
    });

    let hasError = false;

    // Validate từng trường
    fields.forEach(f => {
        const value = document.getElementById(f.id).value.trim();

        if (f.required && !value) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = `Vui lòng nhập ${f.name.toLowerCase()}`;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.pattern && !f.pattern.test(value)) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = f.patternMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.minLength && value.length < f.minLength) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = f.minLengthMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }
    });

    if (hasError) return;

    // Tạo FormData để gửi cả file ảnh
    const formData = new FormData();
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    if (photo) formData.append("photo", photo);

    try {
        const response = await fetch("/admin/add-user", {
            method: "POST",
            headers: {
                "X-CSRFToken": window.csrfToken,
            },
            credentials: "include",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert("error", data.message || "Có lỗi xảy ra khi lưu thông tin");
            return;
        }

        localStorage.setItem('success', data.message);
        window.location.href = "/admin/users";
    } catch (error) {
        console.error(error);
        showAlert("error", "Không thể kết nối tới máy chủ.");
    }
}

async function editUser(event) {
    event.preventDefault();

    const form = document.getElementById("edit-user-form");
    const userId = form.dataset.userId;

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const photo = document.getElementById("photo").files[0];
    const deleteAvatar = document.getElementById("delete_avatar").value;

    // Cấu hình validate cho từng trường
    const fields = [
        {
            id: "firstname",
            name: "First name",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Chỉ chứa chữ và khoảng trắng, 2–50 ký tự"
        },
        {
            id: "lastname",
            name: "Last name",
            required: true,
            pattern: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
            patternMsg: "Chỉ chứa chữ và khoảng trắng, 2–50 ký tự"
        },
        {
            id: "username",
            name: "Username",
            required: true,
            pattern: /^[a-zA-Z0-9_]{3,20}$/,
            patternMsg: "Chỉ chứa chữ, số, _ và từ 3–20 ký tự"
        },
        {
            id: "email",
            name: "Email",
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: "Email không hợp lệ"
        },
        {
            id: "password",
            name: "Password",
            required: false,
            minLength: 8,
            minLengthMsg: "Mật khẩu phải ít nhất 8 ký tự",
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/,
            patternMsg: "Phải có chữ hoa, chữ thường, số, ký tự đặc biệt và không có khoảng trắng"
        }
    ];

    // Reset lỗi
    fields.forEach(f => {
        const el = document.getElementById(`error-add-${f.id}`);
        el.innerText = "";
        el.classList.add("hidden");
    });

    let hasError = false;

    // Validate từng trường
    fields.forEach(f => {
        const value = document.getElementById(f.id).value.trim();

        if (f.id === "password" && value === "") return;

        if (f.required && !value) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = `Vui lòng nhập ${f.name.toLowerCase()}`;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.pattern && !f.pattern.test(value)) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = f.patternMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }

        if (f.minLength && value.length < f.minLength) {
            const el = document.getElementById(`error-add-${f.id}`);
            el.innerText = f.minLengthMsg;
            el.classList.remove("hidden");
            hasError = true;
            return;
        }
    });

    if (hasError) return;

    // Tạo FormData để gửi cả file ảnh
    const formData = new FormData();
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("username", username);
    formData.append("email", email);
    if (password) formData.append("password", password);
    if (photo) formData.append("photo", photo);
    formData.append("delete_avatar", deleteAvatar);

    try {
        const response = await fetch(`/admin/edit-user/${userId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": window.csrfToken,
            },
            credentials: "include",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert("error", data.message || "Có lỗi xảy ra khi lưu thông tin");
            return;
        }

        localStorage.setItem('success', data.message);
        window.location.href = "/admin/users";
    } catch (error) {
        console.error(error);
        showAlert("error", "Không thể kết nối tới máy chủ.");
    }
}

async function deleteUser(event, userId) {
    event.preventDefault();

    try {
        const response = await fetch(`/admin/delete-user/${userId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": window.csrfToken,
            },
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert("error", data.message || "Có lỗi xảy ra khi lưu thông tin");
            return;
        }
        localStorage.setItem('success', data.message);
        window.location.href = "/admin/users";
    } catch (error) {
        console.error(error);
        showAlert("error", "Không thể kết nối tới máy chủ.");
    }
}

function deletePhoto() {
    const preview = document.getElementById("photo-preview");
    const placeholder = document.getElementById("photo-placeholder");
    const deleteFlag = document.getElementById("delete_avatar");
    const photoInput = document.getElementById("photo");

    // Ẩn ảnh và hiển thị SVG mặc định
    if (preview) preview.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");

    // Reset file input
    if (photoInput) photoInput.value = "";

    // Đặt cờ xóa = true
    deleteFlag.value = "true";
}
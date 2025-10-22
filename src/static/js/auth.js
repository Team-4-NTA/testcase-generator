async function login(event) {
    event.preventDefault();

    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const emailError = document.getElementById("error-email");
    const passwordError = document.getElementById("error-password");

    // Reset lỗi
    emailError.textContent = "";
    emailError.classList.add("hidden");
    passwordError.textContent = "";
    passwordError.classList.add("hidden");

    let hasError = false;

    if (email === "") {
        emailError.textContent = "Vui lòng nhập email của bạn.";
        emailError.classList.remove("hidden");
        hasError = true;
    }

    if (password === "") {
        passwordError.textContent = "Vui lòng nhập mật khẩu.";
        passwordError.classList.remove("hidden");
        hasError = true;
    }

    if (hasError) return;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRFToken": csrftoken,
        },
        body: new URLSearchParams({
            email: email,
            password: password,
        }),
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('loginSuccess', 'Đăng nhập thành công!');
        window.location.href = "/"; 
    } else {
        showAlert('error', data.message);
    }
}


async function resetPassword(event) {
  event.preventDefault();

  const password = document.getElementById("password");
  const passwordComfirm = document.getElementById("password-comfirm");
  const errPw = document.getElementById("error-password");
  const errPwComfirm = document.getElementById("error-password-comfirm");
  const url = document.getElementById("resetUrl").value;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  const rules = {
    required: true,
    minLength: 8,
    minLengthMsg: "Mật khẩu phải từ 8 ký tự trở lên",
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/,
    patternMsg:
      "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng",
  };

  // Reset lỗi
  [errPw, errPwComfirm].forEach(el => el.classList.add("hidden"));

  const validate = (value) => {
    if (rules.required && !value) return "Vui lòng nhập mật khẩu";
    if (value.length < rules.minLength) return rules.minLengthMsg;
    if (!rules.pattern.test(value)) return rules.patternMsg;
    return "";
  };

  let pwError = validate(password.value.trim());
  let confirmError =
    password.value.trim() !== passwordComfirm.value.trim()
      ? "Mật khẩu nhập lại không khớp."
      : "";

  if (pwError || confirmError) {
    if (pwError) {
      errPw.textContent = pwError;
      errPw.classList.remove("hidden");
    }
    if (confirmError) {
      errPwComfirm.textContent = confirmError;
      errPwComfirm.classList.remove("hidden");
    }
    return;
  }

  // Gửi request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        password: password.value.trim(),
        passwordComfirm: passwordComfirm.value.trim(),
      }),
    });

    const data = await response.json();
    showAlert(response.ok ? "success" : "error", data.message);
    if (response.ok) setTimeout(() => (window.location.href = "/login"), 2000);
  } catch (err) {
    console.error(err);
    showAlert("error", "Có lỗi xảy ra. Vui lòng thử lại sau.");
  }
}


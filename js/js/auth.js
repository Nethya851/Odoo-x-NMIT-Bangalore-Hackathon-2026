/* =========================================
   DAYFLOW HRMS
   AUTHENTICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentPage = window.location.pathname
        .split("/")
        .pop();

    const loggedInUser = getCurrentUser();


    /* =========================================
       LOGOUT
       ========================================= */

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            localStorage.removeItem("dayflowCurrentUser");

            window.location.href = "login.html";

        });

    }


    /* =========================================
       LOGIN PAGE
       ========================================= */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const emailInput = document.getElementById("loginEmail");
            const passwordInput = document.getElementById("loginPassword");
            const message = document.getElementById("loginMessage");

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";


            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            const users = getUsers();

            const user = users.find(function (item) {

                return (
                    item.email.toLowerCase() === email.toLowerCase() &&
                    item.password === password
                );

            });


            if (!user) {

                showMessage(
                    message,
                    "Invalid email or password.",
                    "error"
                );

                return;
            }


            localStorage.setItem(
                "dayflowCurrentUser",
                JSON.stringify(user)
            );


            showMessage(
                message,
                "Login successful. Redirecting...",
                "success"
            );


            setTimeout(function () {

                if (user.role === "admin") {

                    window.location.href = "admin-dashboard.html";

                } else {

                    window.location.href = "employee-dashboard.html";

                }

            }, 500);

        });

    }


    /* =========================================
       SIGNUP PAGE
       ========================================= */

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {

        signupForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById("signupName");

            const emailInput =
                document.getElementById("signupEmail");

            const passwordInput =
                document.getElementById("signupPassword");

            const confirmPasswordInput =
                document.getElementById("confirmPassword");

            const message =
                document.getElementById("signupMessage");


            const name = nameInput
                ? nameInput.value.trim()
                : "";

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const confirmPassword = confirmPasswordInput
                ? confirmPasswordInput.value
                : "";


            /* Validation */

            if (!name || !email || !password || !confirmPassword) {

                showMessage(
                    message,
                    "Please fill in all fields.",
                    "error"
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    message,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    message,
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            const users = getUsers();


            const existingUser = users.find(function (item) {

                return item.email.toLowerCase() === email.toLowerCase();

            });


            if (existingUser) {

                showMessage(
                    message,
                    "An account with this email already exists.",
                    "error"
                );

                return;
            }


            const newUser = {

                id: generateEmployeeId(),

                name: name,

                email: email,

                password: password,

                role: "employee",

                phone: "",

                address: "",

                department: "",

                jobPosition: "",

                joiningDate: new Date()
                    .toISOString()
                    .split("T")[0],

                employmentStatus: "Active",

                salary: {

                    basic: 0,

                    allowances: 0,

                    deductions: 0,

                    net: 0

                }

            };


            users.push(newUser);


            localStorage.setItem(
                "dayflowUsers",
                JSON.stringify(users)
            );


            showMessage(
                message,
                "Account created successfully. Redirecting to login...",
                "success"
            );


            signupForm.reset();


            setTimeout(function () {

                window.location.href = "login.html";

            }, 1000);

        });

    }


    /* =========================================
       PROTECT DASHBOARD PAGES
       ========================================= */

    const protectedPages = [

        "employee-dashboard.html",
        "admin-dashboard.html",
        "profile.html",
        "attendance.html",
        "leave.html",
        "payroll.html"

    ];


    if (protectedPages.includes(currentPage)) {

        if (!loggedInUser) {

            window.location.href = "login.html";

            return;
        }


        /* Admin page protection */

        if (
            currentPage === "admin-dashboard.html" &&
            loggedInUser.role !== "admin"
        ) {

            window.location.href = "employee-dashboard.html";

            return;
        }


        /* Employee pages */

        if (
            currentPage !== "admin-dashboard.html" &&
            loggedInUser.role === "admin"
        ) {

            /*
             * Admin can still access common pages.
             * No forced redirect here.
             */

        }

    }


    /* =========================================
       INITIAL ADMIN ACCOUNT
       ========================================= */

    createDefaultAdmin();

});


/* =========================================
   GET USERS
   ========================================= */

function getUsers() {

    const storedUsers =
        localStorage.getItem("dayflowUsers");


    if (!storedUsers) {

        return [];

    }


    try {

        return JSON.parse(storedUsers);

    } catch (error) {

        console.error(
            "Unable to read users:",
            error
        );

        return [];

    }

}


/* =========================================
   GET CURRENT USER
   ========================================= */

function getCurrentUser() {

    const storedUser =
        localStorage.getItem("dayflowCurrentUser");


    if (!storedUser) {

        return null;

    }


    try {

        return JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Unable to read current user:",
            error
        );

        return null;

    }

}


/* =========================================
   GENERATE EMPLOYEE ID
   ========================================= */

function generateEmployeeId() {

    const users = getUsers();

    return "EMP" +
        String(users.length + 1)
            .padStart(4, "0");

}


/* =========================================
   MESSAGE
   ========================================= */

function showMessage(element, text, type) {

    if (!element) {

        return;

    }


    element.textContent = text;

    element.className =
        "form-message " + type;

}


/* =========================================
   DEFAULT ADMIN
   ========================================= */

function createDefaultAdmin() {

    const users = getUsers();


    const adminExists = users.some(function (user) {

        return user.role === "admin";

    });


    if (adminExists) {

        return;

    }


    const admin = {

        id: "ADM0001",

        name: "HR Admin",

        email: "admin@dayflow.com",

        password: "admin123",

        role: "admin",

        phone: "",

        address: "",

        department: "Human Resources",

        jobPosition: "HR Administrator",

        joiningDate: new Date()
            .toISOString()
            .split("T")[0],

        employmentStatus: "Active",

        salary: {

            basic: 0,

            allowances: 0,

            deductions: 0,

            net: 0

        }

    };


    users.push(admin);


    localStorage.setItem(
        "dayflowUsers",
        JSON.stringify(users)
    );

}
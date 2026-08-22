/* =========================================
   DAYFLOW HRMS
   PROFILE
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }


    /* =========================================
       PROFILE DISPLAY
       ========================================= */

    setText("profileName", currentUser.name || "Employee");

    setText("profileEmail", currentUser.email || "-");

    setText(
        "profileRole",
        currentUser.role === "admin"
            ? "HR Admin"
            : "Employee"
    );


    /* =========================================
       PERSONAL INFORMATION
       ========================================= */

    setValue("fullName", currentUser.name || "");

    setValue("employeeId", currentUser.id || "");

    setValue("email", currentUser.email || "");

    setValue("phone", currentUser.phone || "");

    setValue("address", currentUser.address || "");


    /* =========================================
       JOB INFORMATION
       ========================================= */

    setText(
        "department",
        currentUser.department || "Not assigned"
    );

    setText(
        "jobPosition",
        currentUser.jobPosition || "Not assigned"
    );

    setText(
        "joiningDate",
        currentUser.joiningDate || "Not assigned"
    );

    setText(
        "employmentStatus",
        currentUser.employmentStatus || "Active"
    );


    /* =========================================
       SALARY INFORMATION
       ========================================= */

    const salary = currentUser.salary || {};

    setText(
        "basicSalary",
        formatCurrency(salary.basic)
    );

    setText(
        "allowances",
        formatCurrency(salary.allowances)
    );

    setText(
        "deductions",
        formatCurrency(salary.deductions)
    );

    setText(
        "netSalary",
        formatCurrency(salary.net)
    );


    /* =========================================
       EDIT PROFILE
       ========================================= */

    const editButton =
        document.getElementById(
            "editPersonalButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelPersonalButton"
        );

    const form =
        document.getElementById(
            "personalInfoForm"
        );

    const formActions =
        document.getElementById(
            "personalFormActions"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                setEditable(true);

                if (formActions) {
                    formActions.style.display =
                        "flex";
                }

                editButton.style.display =
                    "none";

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                setValue(
                    "fullName",
                    currentUser.name || ""
                );

                setValue(
                    "phone",
                    currentUser.phone || ""
                );

                setValue(
                    "address",
                    currentUser.address || ""
                );

                setEditable(false);

                if (formActions) {
                    formActions.style.display =
                        "none";
                }

                if (editButton) {
                    editButton.style.display =
                        "inline-flex";
                }

                showMessage(
                    "",
                    ""
                );

            }
        );

    }


    /* =========================================
       SAVE PROFILE
       ========================================= */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const fullName =
                    document.getElementById(
                        "fullName"
                    ).value.trim();


                const phone =
                    document.getElementById(
                        "phone"
                    ).value.trim();


                const address =
                    document.getElementById(
                        "address"
                    ).value.trim();


                if (!fullName) {

                    showMessage(
                        "profileMessage",
                        "Name cannot be empty.",
                        "error"
                    );

                    return;
                }


                const users =
                    getAllUsers();


                const userIndex =
                    users.findIndex(
                        function (user) {

                            return user.id ===
                                currentUser.id;

                        }
                    );


                if (userIndex === -1) {

                    showMessage(
                        "profileMessage",
                        "Unable to find your account.",
                        "error"
                    );

                    return;
                }


                users[userIndex].name =
                    fullName;

                users[userIndex].phone =
                    phone;

                users[userIndex].address =
                    address;


                /* Update users storage */

                localStorage.setItem(
                    "dayflowUsers",
                    JSON.stringify(users)
                );


                /* Update current session */

                const updatedUser =
                    users[userIndex];


                localStorage.setItem(
                    "dayflowCurrentUser",
                    JSON.stringify(updatedUser)
                );


                /* Update UI */

                setText(
                    "profileName",
                    updatedUser.name
                );


                setValue(
                    "fullName",
                    updatedUser.name
                );


                setValue(
                    "phone",
                    updatedUser.phone
                );


                setValue(
                    "address",
                    updatedUser.address
                );


                setEditable(false);


                if (formActions) {
                    formActions.style.display =
                        "none";
                }


                if (editButton) {
                    editButton.style.display =
                        "inline-flex";
                }


                showMessage(
                    "profileMessage",
                    "Profile updated successfully.",
                    "success"
                );

            }
        );

    }

});


/* =========================================
   CURRENT USER
   ========================================= */

function getCurrentUser() {

    const storedUser =
        localStorage.getItem(
            "dayflowCurrentUser"
        );


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
   GET USERS
   ========================================= */

function getAllUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "dayflowUsers"
            ) || "[]"
        );

    } catch (error) {

        return [];

    }

}


/* =========================================
   SET TEXT
   ========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }

}


/* =========================================
   SET INPUT VALUE
   ========================================= */

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value =
            value;
    }

}


/* =========================================
   EDITABLE STATE
   ========================================= */

function setEditable(editable) {

    const editableFields = [
        "fullName",
        "phone",
        "address"
    ];


    editableFields.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }


            if (editable) {

                element.removeAttribute(
                    "readonly"
                );

            } else {

                element.setAttribute(
                    "readonly",
                    "readonly"
                );

            }

        }
    );

}


/* =========================================
   MESSAGE
   ========================================= */

function showMessage(
    elementId,
    text,
    type
) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    element.textContent =
        text;


    element.className =
        "form-message";


    if (type) {

        element.classList.add(type);

    }

}


/* =========================================
   CURRENCY
   ========================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}
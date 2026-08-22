/* =========================================
   DAYFLOW HRMS
   ADMIN DASHBOARD
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    if (currentUser.role !== "admin") {
        window.location.href = "employee-dashboard.html";
        return;
    }


    /* =========================================
       ADMIN NAME
       ========================================= */

    const adminName =
        document.getElementById("adminName");

    if (adminName) {
        adminName.textContent =
            currentUser.name || "HR Admin";
    }


    /* =========================================
       QUICK ACTIONS
       ========================================= */

    const employeeButton =
        document.getElementById(
            "employeeManagementButton"
        );

    if (employeeButton) {

        employeeButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "profile.html";

            }
        );

    }


    const attendanceButton =
        document.getElementById(
            "adminAttendanceButton"
        );

    if (attendanceButton) {

        attendanceButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "attendance.html";

            }
        );

    }


    const leaveButton =
        document.getElementById(
            "adminLeaveButton"
        );

    if (leaveButton) {

        leaveButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "leave.html";

            }
        );

    }


    const payrollButton =
        document.getElementById(
            "adminPayrollButton"
        );

    if (payrollButton) {

        payrollButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "payroll.html";

            }
        );

    }


    /* =========================================
       LOAD DASHBOARD DATA
       ========================================= */

    loadEmployeeSummary();

    loadAttendanceSummary();

    loadLeaveSummary();

    loadPayrollSummary();

    loadEmployeeTable();

    loadLeaveTable();

    loadRecentActivity();

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
   EMPLOYEE SUMMARY
   ========================================= */

function loadEmployeeSummary() {

    const users = getAllUsers();

    const employees =
        users.filter(function (user) {

            return user.role === "employee";

        });


    const totalEmployees =
        document.getElementById(
            "totalEmployees"
        );

    if (totalEmployees) {

        totalEmployees.textContent =
            employees.length;

    }

}


/* =========================================
   ATTENDANCE SUMMARY
   ========================================= */

function loadAttendanceSummary() {

    let records = [];

    try {

        records = JSON.parse(
            localStorage.getItem(
                "dayflowAttendance"
            ) || "[]"
        );

    } catch (error) {

        records = [];

    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const presentToday =
        records.filter(function (record) {

            return (
                record.date === today &&
                record.status === "Present"
            );

        }).length;


    const presentElement =
        document.getElementById(
            "totalPresent"
        );

    if (presentElement) {

        presentElement.textContent =
            presentToday;

    }

}


/* =========================================
   LEAVE SUMMARY
   ========================================= */

function loadLeaveSummary() {

    let requests = [];

    try {

        requests = JSON.parse(
            localStorage.getItem(
                "dayflowLeaveRequests"
            ) || "[]"
        );

    } catch (error) {

        requests = [];

    }


    const pending =
        requests.filter(function (request) {

            return request.status === "Pending";

        }).length;


    const pendingElement =
        document.getElementById(
            "pendingLeaves"
        );

    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }

}


/* =========================================
   PAYROLL SUMMARY
   ========================================= */

function loadPayrollSummary() {

    const users = getAllUsers();

    let totalPayroll = 0;


    users.forEach(function (user) {

        if (
            user.role === "employee" &&
            user.salary
        ) {

            totalPayroll +=
                Number(user.salary.net || 0);

        }

    });


    const payrollElement =
        document.getElementById(
            "totalPayroll"
        );


    if (payrollElement) {

        payrollElement.textContent =
            formatCurrency(totalPayroll);

    }

}


/* =========================================
   EMPLOYEE TABLE
   ========================================= */

function loadEmployeeTable() {

    const tableBody =
        document.getElementById(
            "employeeTableBody"
        );


    if (!tableBody) {
        return;
    }


    const users = getAllUsers();

    const employees =
        users.filter(function (user) {

            return user.role === "employee";

        });


    if (employees.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No employees found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        employees.map(function (employee) {

            return `
                <tr>

                    <td>
                        ${escapeHtml(employee.id)}
                    </td>

                    <td>
                        ${escapeHtml(employee.name)}
                    </td>

                    <td>
                        ${escapeHtml(employee.email)}
                    </td>

                    <td>
                        Employee
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================
   LEAVE TABLE
   ========================================= */

function loadLeaveTable() {

    const tableBody =
        document.getElementById(
            "leaveTableBody"
        );


    if (!tableBody) {
        return;
    }


    let requests = [];

    try {

        requests = JSON.parse(
            localStorage.getItem(
                "dayflowLeaveRequests"
            ) || "[]"
        );

    } catch (error) {

        requests = [];

    }


    if (requests.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No leave requests found.
                </td>
            </tr>
        `;

        return;
    }


    const users = getAllUsers();


    tableBody.innerHTML =
        requests.slice(-10).reverse()
        .map(function (request) {

            const employee =
                users.find(function (user) {

                    return user.id ===
                        request.employeeId;

                });


            const employeeName =
                employee
                    ? employee.name
                    : "Unknown";


            return `
                <tr>

                    <td>
                        ${escapeHtml(employeeName)}
                    </td>

                    <td>
                        ${escapeHtml(
                            request.leaveType || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            request.fromDate || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            request.toDate || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            request.status || "Pending"
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================
   RECENT ACTIVITY
   ========================================= */

function loadRecentActivity() {

    const container =
        document.getElementById(
            "adminRecentActivity"
        );


    if (!container) {
        return;
    }


    const users = getAllUsers();

    let leaves = [];

    try {

        leaves = JSON.parse(
            localStorage.getItem(
                "dayflowLeaveRequests"
            ) || "[]"
        );

    } catch (error) {

        leaves = [];

    }


    if (leaves.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <span>
                    📋
                </span>

                <p>
                    No recent activity.
                </p>

            </div>
        `;

        return;
    }


    const recent =
        leaves.slice(-5).reverse();


    container.innerHTML =
        recent.map(function (request) {

            const employee =
                users.find(function (user) {

                    return user.id ===
                        request.employeeId;

                });


            const name =
                employee
                    ? employee.name
                    : "Employee";


            return `
                <div class="info-item">

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <span class="info-label">
                        Leave request:
                        ${escapeHtml(
                            request.leaveType || "Leave"
                        )}
                    </span>

                    <span class="info-label">
                        Status:
                        ${escapeHtml(
                            request.status || "Pending"
                        )}
                    </span>

                </div>
            `;

        }).join("");

}


/* =========================================
   CURRENCY
   ========================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN");

}


/* =========================================
   SAFE HTML
   ========================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;

}
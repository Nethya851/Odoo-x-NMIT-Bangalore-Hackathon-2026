/* =========================================
   DAYFLOW HRMS
   EMPLOYEE DASHBOARD
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }


    /* =========================================
       EMPLOYEE DETAILS
       ========================================= */

    const employeeNames =
        document.querySelectorAll(".employee-name");

    employeeNames.forEach(function (element) {
        element.textContent =
            currentUser.name || "Employee";
    });


    const employeeId =
        document.querySelector(".employee-id");

    if (employeeId) {
        employeeId.textContent =
            currentUser.id || "-";
    }


    const employeeEmail =
        document.querySelector(".employee-email");

    if (employeeEmail) {
        employeeEmail.textContent =
            currentUser.email || "-";
    }


    /* =========================================
       NAVIGATION BUTTONS
       ========================================= */

    const profileButton =
        document.getElementById("profileButton");

    if (profileButton) {

        profileButton.addEventListener("click", function () {

            window.location.href = "profile.html";

        });

    }


    const attendanceButton =
        document.getElementById("attendanceButton");

    if (attendanceButton) {

        attendanceButton.addEventListener("click", function () {

            window.location.href = "attendance.html";

        });

    }


    const leaveButton =
        document.getElementById("leaveButton");

    if (leaveButton) {

        leaveButton.addEventListener("click", function () {

            window.location.href = "leave.html";

        });

    }


    const payrollButton =
        document.getElementById("payrollButton");

    if (payrollButton) {

        payrollButton.addEventListener("click", function () {

            window.location.href = "payroll.html";

        });

    }


    /* =========================================
       ATTENDANCE SUMMARY
       ========================================= */

    updateAttendanceSummary(currentUser.id);


    /* =========================================
       LEAVE SUMMARY
       ========================================= */

    updateLeaveSummary(currentUser.id);


    /* =========================================
       RECENT ACTIVITY
       ========================================= */

    updateRecentActivity(currentUser.id);

});


/* =========================================
   CURRENT USER
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
   ATTENDANCE SUMMARY
   ========================================= */

function updateAttendanceSummary(employeeId) {

    const records =
        JSON.parse(
            localStorage.getItem("dayflowAttendance") || "[]"
        );


    const employeeRecords =
        records.filter(function (record) {

            return record.employeeId === employeeId;

        });


    const presentCount =
        employeeRecords.filter(function (record) {

            return record.status === "Present";

        }).length;


    const absentCount =
        employeeRecords.filter(function (record) {

            return record.status === "Absent";

        }).length;


    const leaveCount =
        employeeRecords.filter(function (record) {

            return record.status === "Leave";

        }).length;


    const presentElement =
        document.getElementById("presentCount");

    if (presentElement) {
        presentElement.textContent =
            presentCount;
    }


    const absentElement =
        document.getElementById("absentCount");

    if (absentElement) {
        absentElement.textContent =
            absentCount;
    }


    const leaveElement =
        document.getElementById("leaveCount");

    if (leaveElement) {
        leaveElement.textContent =
            leaveCount;
    }

}


/* =========================================
   LEAVE SUMMARY
   ========================================= */

function updateLeaveSummary(employeeId) {

    const requests =
        JSON.parse(
            localStorage.getItem("dayflowLeaveRequests") || "[]"
        );


    const employeeRequests =
        requests.filter(function (request) {

            return request.employeeId === employeeId;

        });


    const pending =
        employeeRequests.filter(function (request) {

            return request.status === "Pending";

        }).length;


    const approved =
        employeeRequests.filter(function (request) {

            return request.status === "Approved";

        }).length;


    const rejected =
        employeeRequests.filter(function (request) {

            return request.status === "Rejected";

        }).length;


    const pendingElement =
        document.getElementById("pendingLeaveCount");

    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }


    const approvedElement =
        document.getElementById("approvedLeaveCount");

    if (approvedElement) {
        approvedElement.textContent =
            approved;
    }


    const rejectedElement =
        document.getElementById("rejectedLeaveCount");

    if (rejectedElement) {
        rejectedElement.textContent =
            rejected;
    }


    const leaveCount =
        document.getElementById("leaveCount");

    if (leaveCount) {
        leaveCount.textContent =
            approved;
    }

}


/* =========================================
   RECENT ACTIVITY
   ========================================= */

function updateRecentActivity(employeeId) {

    const container =
        document.getElementById("recentActivity");


    if (!container) {
        return;
    }


    const attendance =
        JSON.parse(
            localStorage.getItem("dayflowAttendance") || "[]"
        );


    const leaves =
        JSON.parse(
            localStorage.getItem("dayflowLeaveRequests") || "[]"
        );


    const activities = [];


    attendance
        .filter(function (record) {

            return record.employeeId === employeeId;

        })
        .slice(-5)
        .forEach(function (record) {

            activities.push({

                date: record.date || "",

                text:
                    "Attendance marked as " +
                    (record.status || "Present")

            });

        });


    leaves
        .filter(function (request) {

            return request.employeeId === employeeId;

        })
        .slice(-5)
        .forEach(function (request) {

            activities.push({

                date: request.fromDate || "",

                text:
                    "Leave request submitted - " +
                    (request.leaveType || "Leave")

            });

        });


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <span>📋</span>
                <p>No recent activity.</p>
            </div>
        `;

        return;
    }


    activities.sort(function (a, b) {

        return new Date(b.date) - new Date(a.date);

    });


    container.innerHTML = activities
        .slice(0, 5)
        .map(function (activity) {

            return `
                <div class="info-item">
                    <strong>
                        ${escapeHtml(activity.text)}
                    </strong>

                    <span class="info-label">
                        ${escapeHtml(activity.date)}
                    </span>
                </div>
            `;

        })
        .join("");

}


/* =========================================
   SAFE HTML
   ========================================= */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;

}
/* =========================================
   DAYFLOW HRMS
   ATTENDANCE
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    loadTodayAttendance(currentUser.id);
    loadAttendanceHistory(currentUser.id);

    const checkInButton =
        document.getElementById("checkInButton");

    const checkOutButton =
        document.getElementById("checkOutButton");


    if (checkInButton) {

        checkInButton.addEventListener("click", function () {

            markCheckIn(currentUser.id);

        });

    }


    if (checkOutButton) {

        checkOutButton.addEventListener("click", function () {

            markCheckOut(currentUser.id);

        });

    }

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
        return null;
    }

}


/* =========================================
   GET ATTENDANCE RECORDS
   ========================================= */

function getAttendanceRecords() {

    try {

        return JSON.parse(
            localStorage.getItem("dayflowAttendance") || "[]"
        );

    } catch (error) {

        return [];

    }

}


/* =========================================
   SAVE ATTENDANCE RECORDS
   ========================================= */

function saveAttendanceRecords(records) {

    localStorage.setItem(
        "dayflowAttendance",
        JSON.stringify(records)
    );

}


/* =========================================
   TODAY DATE
   ========================================= */

function getTodayDate() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


/* =========================================
   CURRENT TIME
   ========================================= */

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================
   CHECK IN
   ========================================= */

function markCheckIn(employeeId) {

    const records =
        getAttendanceRecords();

    const today =
        getTodayDate();


    let record =
        records.find(function (item) {

            return (
                item.employeeId === employeeId &&
                item.date === today
            );

        });


    if (record && record.checkIn) {

        showAttendanceMessage(
            "Already checked in today.",
            "error"
        );

        return;
    }


    const checkInTime =
        getCurrentTime();


    if (record) {

        record.checkIn =
            checkInTime;

        record.status =
            "Present";

    } else {

        record = {

            id:
                "ATT-" +
                Date.now(),

            employeeId:
                employeeId,

            date:
                today,

            checkIn:
                checkInTime,

            checkOut:
                "",

            status:
                "Present"

        };

        records.push(record);

    }


    saveAttendanceRecords(records);


    showAttendanceMessage(
        "Check-in recorded successfully.",
        "success"
    );


    loadTodayAttendance(employeeId);
    loadAttendanceHistory(employeeId);

}


/* =========================================
   CHECK OUT
   ========================================= */

function markCheckOut(employeeId) {

    const records =
        getAttendanceRecords();

    const today =
        getTodayDate();


    const record =
        records.find(function (item) {

            return (
                item.employeeId === employeeId &&
                item.date === today
            );

        });


    if (!record || !record.checkIn) {

        showAttendanceMessage(
            "Please check in before checking out.",
            "error"
        );

        return;
    }


    if (record.checkOut) {

        showAttendanceMessage(
            "Already checked out today.",
            "error"
        );

        return;
    }


    record.checkOut =
        getCurrentTime();


    saveAttendanceRecords(records);


    showAttendanceMessage(
        "Check-out recorded successfully.",
        "success"
    );


    loadTodayAttendance(employeeId);
    loadAttendanceHistory(employeeId);

}


/* =========================================
   LOAD TODAY ATTENDANCE
   ========================================= */

function loadTodayAttendance(employeeId) {

    const records =
        getAttendanceRecords();

    const today =
        getTodayDate();


    const record =
        records.find(function (item) {

            return (
                item.employeeId === employeeId &&
                item.date === today
            );

        });


    const statusElement =
        document.getElementById("attendanceStatus");

    const checkInElement =
        document.getElementById("checkInTime");

    const checkOutElement =
        document.getElementById("checkOutTime");

    const checkInButton =
        document.getElementById("checkInButton");

    const checkOutButton =
        document.getElementById("checkOutButton");


    if (statusElement) {

        statusElement.textContent =
            record
                ? record.status
                : "Not Marked";

    }


    if (checkInElement) {

        checkInElement.textContent =
            record && record.checkIn
                ? record.checkIn
                : "--";

    }


    if (checkOutElement) {

        checkOutElement.textContent =
            record && record.checkOut
                ? record.checkOut
                : "--";

    }


    if (checkInButton) {

        checkInButton.disabled =
            !!(record && record.checkIn);

    }


    if (checkOutButton) {

        checkOutButton.disabled =
            !(record && record.checkIn) ||
            !!(record && record.checkOut);

    }

}


/* =========================================
   LOAD HISTORY
   ========================================= */

function loadAttendanceHistory(employeeId) {

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tableBody) {
        return;
    }


    const records =
        getAttendanceRecords()
            .filter(function (record) {

                return record.employeeId === employeeId;

            })
            .sort(function (a, b) {

                return new Date(b.date) -
                    new Date(a.date);

            });


    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        records.map(function (record) {

            return `
                <tr>

                    <td>
                        ${escapeHtml(record.date)}
                    </td>

                    <td>
                        ${escapeHtml(record.checkIn || "--")}
                    </td>

                    <td>
                        ${escapeHtml(record.checkOut || "--")}
                    </td>

                    <td>
                        ${escapeHtml(record.status || "--")}
                    </td>

                    <td>
                        ${calculateWorkingHours(record)}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================
   WORKING HOURS
   ========================================= */

function calculateWorkingHours(record) {

    if (!record.checkIn || !record.checkOut) {
        return "--";
    }


    const start =
        parseTime(record.checkIn);

    const end =
        parseTime(record.checkOut);


    if (!start || !end) {
        return "--";
    }


    let difference =
        end - start;


    if (difference < 0) {
        difference += 24 * 60;
    }


    const hours =
        Math.floor(difference / 60);

    const minutes =
        difference % 60;


    return hours + "h " +
        minutes + "m";

}


/* =========================================
   PARSE TIME
   ========================================= */

function parseTime(timeString) {

    const match =
        timeString.match(
            /(\d+):(\d+)\s*(AM|PM)/i
        );


    if (!match) {
        return null;
    }


    let hours =
        parseInt(match[1], 10);

    const minutes =
        parseInt(match[2], 10);

    const period =
        match[3].toUpperCase();


    if (period === "PM" && hours !== 12) {
        hours += 12;
    }


    if (period === "AM" && hours === 12) {
        hours = 0;
    }


    return hours * 60 + minutes;

}


/* =========================================
   MESSAGE
   ========================================= */

function showAttendanceMessage(
    text,
    type
) {

    const element =
        document.getElementById(
            "attendanceMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        text;

    element.className =
        "form-message " + type;

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
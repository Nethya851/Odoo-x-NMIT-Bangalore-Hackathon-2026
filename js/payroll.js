/* =========================================
   DAYFLOW HRMS
   PAYROLL
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    loadCurrentSalary(currentUser);
    loadPayrollHistory(currentUser.id);

    const yearFilter =
        document.getElementById("payrollYear");

    if (yearFilter) {

        yearFilter.addEventListener(
            "change",
            function () {

                loadPayrollHistory(
                    currentUser.id,
                    yearFilter.value
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

        return null;

    }

}


/* =========================================
   GET USERS
   ========================================= */

function getUsers() {

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
   LOAD CURRENT SALARY
   ========================================= */

function loadCurrentSalary(user) {

    const salary =
        user.salary || {

            basic: 0,
            allowances: 0,
            deductions: 0,
            net: 0

        };


    const basic =
        Number(salary.basic || 0);

    const allowances =
        Number(salary.allowances || 0);

    const deductions =
        Number(salary.deductions || 0);


    const net =
        Number(
            salary.net ||
            (basic + allowances - deductions)
        );


    setText(
        "currentBasicSalary",
        formatCurrency(basic)
    );


    setText(
        "currentAllowances",
        formatCurrency(allowances)
    );


    setText(
        "currentDeductions",
        formatCurrency(deductions)
    );


    setText(
        "currentNetSalary",
        formatCurrency(net)
    );


    setText(
        "paymentStatus",
        net > 0
            ? "Available"
            : "Not Available"
    );

}


/* =========================================
   LOAD PAYROLL HISTORY
   ========================================= */

function loadPayrollHistory(
    employeeId,
    selectedYear = "all"
) {

    const tableBody =
        document.getElementById(
            "payrollTableBody"
        );


    if (!tableBody) {
        return;
    }


    const records =
        getPayrollRecords()
            .filter(function (record) {

                return (
                    record.employeeId ===
                    employeeId
                );

            });


    let filteredRecords =
        records;


    if (selectedYear !== "all") {

        filteredRecords =
            records.filter(
                function (record) {

                    return (
                        String(
                            record.year
                        ) ===
                        String(
                            selectedYear
                        )
                    );

                }
            );

    }


    if (filteredRecords.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td colspan="6">
                    No payroll records found.
                </td>

            </tr>
        `;

        return;

    }


    tableBody.innerHTML =
        filteredRecords
            .sort(function (a, b) {

                return (
                    Number(b.year) -
                    Number(a.year)
                );

            })
            .map(function (record) {

                return `
                    <tr>

                        <td>
                            ${escapeHtml(
                                record.month
                            )}
                            ${record.year}
                        </td>

                        <td>
                            ${formatCurrency(
                                record.basic
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                record.allowances
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                record.deductions
                            )}
                        </td>

                        <td>
                            ${formatCurrency(
                                record.net
                            )}
                        </td>

                        <td>
                            <span class="status-badge">
                                ${escapeHtml(
                                    record.status ||
                                    "Processed"
                                )}
                            </span>
                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================
   GET PAYROLL RECORDS
   ========================================= */

function getPayrollRecords() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "dayflowPayroll"
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
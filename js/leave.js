function submitLeaveRequest(employeeId) {

    const leaveType =
        getValue("leaveType");

    const fromDate =
        getValue("fromDate");

    const toDate =
        getValue("toDate");

    // IMPORTANT: HTML-la textarea id = leaveRemarks
    const reason =
        getValue("leaveRemarks");


    if (
        !leaveType ||
        !fromDate ||
        !toDate ||
        !reason
    ) {

        showLeaveMessage(
            "Please fill in all leave details.",
            "error"
        );

        return;

    }


    const startDate =
        new Date(fromDate);

    const endDate =
        new Date(toDate);


    if (endDate < startDate) {

        showLeaveMessage(
            "To date cannot be before from date.",
            "error"
        );

        return;

    }


    const requests =
        getLeaveRequests();


    const overlapping =
        requests.some(function (request) {

            if (
                request.employeeId !==
                employeeId
            ) {
                return false;
            }


            if (
                request.status ===
                "Rejected"
            ) {
                return false;
            }


            const existingStart =
                new Date(
                    request.fromDate
                );

            const existingEnd =
                new Date(
                    request.toDate
                );


            return (
                startDate <= existingEnd &&
                endDate >= existingStart
            );

        });


    if (overlapping) {

        showLeaveMessage(
            "You already have a leave request for this period.",
            "error"
        );

        return;

    }


    const request = {

        id:
            "LEAVE-" +
            Date.now(),

        employeeId:
            employeeId,

        leaveType:
            leaveType,

        fromDate:
            fromDate,

        toDate:
            toDate,

        reason:
            reason,

        status:
            "Pending",

        createdAt:
            new Date().toISOString()

    };


    requests.push(request);


    saveLeaveRequests(requests);


    showLeaveMessage(
        "Leave request submitted successfully.",
        "success"
    );


    const form =
        document.getElementById(
            "leaveForm"
        );


    if (form) {
        form.reset();
    }


    loadLeaveRequests(employeeId);

}
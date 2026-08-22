CREATE DATABASE IF NOT EXISTS dayflow;

USE dayflow;


-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS users (

    id VARCHAR(20) PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('admin', 'employee')
        NOT NULL DEFAULT 'employee',

    phone VARCHAR(20),

    address TEXT,

    department VARCHAR(100),

    job_position VARCHAR(100),

    joining_date DATE,

    employment_status ENUM(
        'Active',
        'Inactive'
    ) DEFAULT 'Active',

    basic_salary DECIMAL(12,2)
        DEFAULT 0,

    allowances DECIMAL(12,2)
        DEFAULT 0,

    deductions DECIMAL(12,2)
        DEFAULT 0,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);


-- =========================================
-- ATTENDANCE TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS attendance (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL,

    attendance_date DATE NOT NULL,

    check_in TIME NULL,

    check_out TIME NULL,

    working_minutes INT
        DEFAULT 0,

    status ENUM(
        'Present',
        'Absent',
        'Half Day',
        'Leave'
    ) DEFAULT 'Present',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_employee_date (
        employee_id,
        attendance_date
    ),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);


-- =========================================
-- LEAVE REQUESTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS leave_requests (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL,

    leave_type VARCHAR(50) NOT NULL,

    from_date DATE NOT NULL,

    to_date DATE NOT NULL,

    reason TEXT NOT NULL,

    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leave_employee
        FOREIGN KEY (employee_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);


-- =========================================
-- PAYROLL TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS payroll (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(20) NOT NULL,

    salary_month VARCHAR(7) NOT NULL,

    basic_salary DECIMAL(12,2)
        DEFAULT 0,

    allowances DECIMAL(12,2)
        DEFAULT 0,

    deductions DECIMAL(12,2)
        DEFAULT 0,

    net_salary DECIMAL(12,2)
        DEFAULT 0,

    payment_status ENUM(
        'Pending',
        'Paid'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_employee_month (
        employee_id,
        salary_month
    ),

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);
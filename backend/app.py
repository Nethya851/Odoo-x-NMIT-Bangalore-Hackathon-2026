from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

import mysql.connector
import os
from datetime import datetime, date


# ==========================================================
# LOAD ENV
# ==========================================================

load_dotenv()


# ==========================================================
# FLASK APP
# ==========================================================

app = Flask(__name__)

CORS(app)


# ==========================================================
# DATABASE CONFIG
# ==========================================================

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "dayflow")
}


# ==========================================================
# DATABASE CONNECTION
# ==========================================================

def get_db():

    return mysql.connector.connect(
        **DB_CONFIG
    )



# ==========================================================
# FORMATTER HELPER
# ==========================================================

def format_user(row):
    if not row: return None
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "email": row.get("email"),
        "role": row.get("role", "employee"),
        "phone": row.get("phone", ""),
        "address": row.get("address", ""),
        "department": row.get("department", ""),
        "jobPosition": row.get("job_position", ""),
        "joiningDate": str(row.get("joining_date")) if row.get("joining_date") else "",
        "employmentStatus": row.get("employment_status", "Active"),
        "salary": {
            "basic": float(row.get("basic_salary") or 0),
            "allowances": float(row.get("allowances") or 0),
            "deductions": float(row.get("deductions") or 0),
            "net": float((row.get("basic_salary") or 0) + (row.get("allowances") or 0) - (row.get("deductions") or 0))
        }
    }

# ==========================================================
# HOME

# ==========================================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "Dayflow HRMS Backend is running"
    })


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route("/api/health")
def health():

    try:

        db = get_db()

        db.close()

        return jsonify({
            "success": True,
            "message": "Backend and MySQL connected successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================================
# LOGIN
# ==========================================================

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400


    email = data.get("email", "").strip().lower()

    password = data.get("password", "")


    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400


    try:

        db = get_db()

        cursor = db.cursor(dictionary=True)


        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                password_hash,
                role,
                phone,
                address,
                department,
                job_position,
                joining_date,
                employment_status,
                basic_salary,
                allowances,
                deductions
            FROM users
            WHERE email = %s
            """,
            (email,)
        )


        user = cursor.fetchone()


        if not user:

            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401


        if not check_password_hash(
            user["password_hash"],
            password
        ):

            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401


        user = format_user(user)

        user.pop("password_hash", None) # ignored now


        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# GET ALL EMPLOYEES
# ==========================================================

@app.route("/api/employees", methods=["GET"])
def get_employees():

    try:

        db = get_db()

        cursor = db.cursor(dictionary=True)


        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                address,
                department,
                job_position,
                joining_date,
                employment_status,
                basic_salary,
                allowances,
                deductions
            FROM users
            WHERE role = 'employee'
            ORDER BY name ASC
            """
        )


        employees = [format_user(e) for e in cursor.fetchall()]


        return jsonify({
            "success": True,
            "employees": employees
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# GET SINGLE EMPLOYEE
# ==========================================================

@app.route(
    "/api/employees/<employee_id>",
    methods=["GET"]
)
def get_employee(employee_id):

    try:

        db = get_db()

        cursor = db.cursor(dictionary=True)


        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                address,
                department,
                job_position,
                joining_date,
                employment_status,
                basic_salary,
                allowances,
                deductions
            FROM users
            WHERE id = %s
            """,
            (employee_id,)
        )


        employee = format_user(cursor.fetchone())


        if not employee:

            return jsonify({
                "success": False,
                "message": "Employee not found"
            }), 404


        return jsonify({
            "success": True,
            "employee": employee
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# CREATE EMPLOYEE
# ==========================================================

@app.route(
    "/api/employees",
    methods=["POST"]
)
def create_employee():

    data = request.get_json()


    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400


    name = data.get("name", "").strip()

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        "employee123"
    )


    if not name or not email:

        return jsonify({
            "success": False,
            "message": "Name and email are required"
        }), 400


    try:

        db = get_db()

        cursor = db.cursor()


        # Generate employee ID

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE role = 'employee'
            ORDER BY id DESC
            LIMIT 1
            """
        )


        result = cursor.fetchone()


        if result:

            last_id = result[0]

            try:

                number = int(
                    last_id.replace(
                        "EMP",
                        ""
                    )
                )

            except:

                number = 0

        else:

            number = 0


        employee_id = (
            "EMP" +
            str(number + 1).zfill(4)
        )


        password_hash = generate_password_hash(
            password
        )


        cursor.execute(
            """
            INSERT INTO users
            (
                id,
                name,
                email,
                password_hash,
                role,
                phone,
                address,
                department,
                job_position,
                joining_date,
                employment_status,
                basic_salary,
                allowances,
                deductions
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                'employee',
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,

            (
                employee_id,
                name,
                email,
                password_hash,

                data.get("phone", ""),

                data.get(
                    "address",
                    ""
                ),

                data.get(
                    "department",
                    ""
                ),

                data.get(
                    "jobPosition",
                    ""
                ),

                data.get(
                    "joiningDate"
                ),

                data.get(
                    "employmentStatus",
                    "Active"
                ),

                data.get(
                    "basicSalary",
                    0
                ),

                data.get(
                    "allowances",
                    0
                ),

                data.get(
                    "deductions",
                    0
                )
            )
        )


        db.commit()


        return jsonify({
            "success": True,
            "message": "Employee created successfully",
            "employeeId": employee_id
        }), 201


    except mysql.connector.IntegrityError:

        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 409


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# UPDATE EMPLOYEE
# ==========================================================

@app.route(
    "/api/employees/<employee_id>",
    methods=["PUT"]
)
def update_employee(employee_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400


    name = data.get("name", "").strip()

    phone = data.get("phone", "").strip()

    address = data.get("address", "").strip()


    if not name:

        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400


    try:

        db = get_db()

        cursor = db.cursor()


        cursor.execute(
            """
            UPDATE users
            SET name = %s, phone = %s, address = %s
            WHERE id = %s
            """,
            (name, phone, address, employee_id)
        )

        db.commit()


        if cursor.rowcount == 0:

            return jsonify({
                "success": False,
                "message": "Employee not found or no changes"
            }), 404


        return jsonify({
            "success": True,
            "message": "Employee updated successfully"
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# ATTENDANCE - CHECK IN
# ==========================================================

@app.route(
    "/api/attendance/check-in",
    methods=["POST"]
)
def check_in():

    data = request.get_json()

    employee_id = data.get(
        "employeeId"
    )


    if not employee_id:

        return jsonify({
            "success": False,
            "message": "Employee ID is required"
        }), 400


    today = date.today()

    current_time = datetime.now().time()


    try:

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT *
            FROM attendance
            WHERE employee_id = %s
            AND attendance_date = %s
            """,
            (
                employee_id,
                today
            )
        )


        record = cursor.fetchone()


        if record and record["check_in"]:

            return jsonify({
                "success": False,
                "message": "Already checked in today"
            }), 409


        if record:

            cursor.execute(
                """
                UPDATE attendance
                SET check_in = %s,
                    status = 'Present'
                WHERE id = %s
                """,
                (
                    current_time,
                    record["id"]
                )
            )

        else:

            cursor.execute(
                """
                INSERT INTO attendance
                (
                    employee_id,
                    attendance_date,
                    check_in,
                    status
                )

                VALUES
                (
                    %s,
                    %s,
                    %s,
                    'Present'
                )
                """,
                (
                    employee_id,
                    today,
                    current_time
                )
            )


        db.commit()


        return jsonify({
            "success": True,
            "message": "Check-in successful",
            "checkIn": current_time.strftime("%H:%M:%S")
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# ATTENDANCE - CHECK OUT
# ==========================================================

@app.route(
    "/api/attendance/check-out",
    methods=["POST"]
)
def check_out():

    data = request.get_json()

    employee_id = data.get(
        "employeeId"
    )


    if not employee_id:

        return jsonify({
            "success": False,
            "message": "Employee ID is required"
        }), 400


    today = date.today()

    current_time = datetime.now().time()


    try:

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT *
            FROM attendance
            WHERE employee_id = %s
            AND attendance_date = %s
            """,
            (
                employee_id,
                today
            )
        )


        record = cursor.fetchone()


        if not record:

            return jsonify({
                "success": False,
                "message": "Please check in first"
            }), 400


        if not record["check_in"]:

            return jsonify({
                "success": False,
                "message": "Please check in first"
            }), 400


        if record["check_out"]:

            return jsonify({
                "success": False,
                "message": "Already checked out today"
            }), 409


        start = datetime.combine(
            today,
            record["check_in"]
        )


        end = datetime.combine(
            today,
            current_time
        )


        working_minutes = int(
            (
                end - start
            ).total_seconds() / 60
        )


        cursor.execute(
            """
            UPDATE attendance

            SET
                check_out = %s,
                working_minutes = %s

            WHERE id = %s
            """,
            (
                current_time,
                working_minutes,
                record["id"]
            )
        )


        db.commit()


        return jsonify({
            "success": True,
            "message": "Check-out successful",
            "checkOut": current_time.strftime(
                "%H:%M:%S"
            ),
            "workingMinutes": working_minutes
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# EMPLOYEE ATTENDANCE
# ==========================================================

@app.route(
    "/api/attendance/<employee_id>",
    methods=["GET"]
)
def employee_attendance(employee_id):

    try:

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                employee_id,
                attendance_date,
                check_in,
                check_out,
                working_minutes,
                status

            FROM attendance

            WHERE employee_id = %s

            ORDER BY attendance_date DESC
            """,
            (employee_id,)
        )


        records = cursor.fetchall()


        return jsonify({
            "success": True,
            "attendance": records
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass



@app.route("/api/attendance", methods=["GET"])
def all_attendance():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM attendance ORDER BY attendance_date DESC")
        return jsonify({"success": True, "attendance": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        try:
            cursor.close(); db.close()
        except: pass

# ==========================================================
# CREATE LEAVE
# ==========================================================

@app.route(
    "/api/leave",
    methods=["POST"]
)
def create_leave():

    data = request.get_json()


    employee_id = data.get(
        "employeeId"
    )

    leave_type = data.get(
        "leaveType"
    )

    from_date = data.get(
        "fromDate"
    )

    to_date = data.get(
        "toDate"
    )

    reason = data.get(
        "reason"
    )


    if not all([
        employee_id,
        leave_type,
        from_date,
        to_date,
        reason
    ]):

        return jsonify({
            "success": False,
            "message": "All leave fields are required"
        }), 400


    try:

        db = get_db()

        cursor = db.cursor()


        cursor.execute(
            """
            INSERT INTO leave_requests
            (
                employee_id,
                leave_type,
                from_date,
                to_date,
                reason,
                status
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                'Pending'
            )
            """,

            (
                employee_id,
                leave_type,
                from_date,
                to_date,
                reason
            )
        )


        db.commit()


        return jsonify({
            "success": True,
            "message": "Leave request submitted",
            "leaveId": cursor.lastrowid
        }), 201


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# EMPLOYEE LEAVES
# ==========================================================

@app.route(
    "/api/leave/employee/<employee_id>",
    methods=["GET"]
)
def employee_leaves(employee_id):

    try:

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT
                id,
                employee_id,
                leave_type,
                from_date,
                to_date,
                reason,
                status,
                created_at

            FROM leave_requests

            WHERE employee_id = %s

            ORDER BY created_at DESC
            """,
            (employee_id,)
        )


        leaves = cursor.fetchall()


        return jsonify({
            "success": True,
            "requests": leaves
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# HR - ALL LEAVES
# ==========================================================

@app.route(
    "/api/leave",
    methods=["GET"]
)
def all_leaves():

    try:

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )


        cursor.execute(
            """
            SELECT

                lr.id,

                lr.employee_id,

                u.name AS employee_name,

                u.email AS employee_email,

                lr.leave_type,

                lr.from_date,

                lr.to_date,

                lr.reason,

                lr.status,

                lr.created_at

            FROM leave_requests lr

            JOIN users u
                ON u.id = lr.employee_id

            ORDER BY lr.created_at DESC
            """
        )


        leaves = cursor.fetchall()


        return jsonify({
            "success": True,
            "requests": leaves
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass


# ==========================================================
# HR - APPROVE / REJECT LEAVE
# ==========================================================

@app.route(
    "/api/leave/<int:leave_id>/status",
    methods=["PUT"]
)
def update_leave(leave_id):

    data = request.get_json()

    status = data.get(
        "status"
    )


    if status not in [
        "Approved",
        "Rejected"
    ]:

        return jsonify({
            "success": False,
            "message": "Invalid status"
        }), 400


    try:

        db = get_db()

        cursor = db.cursor()


        cursor.execute(
            """
            UPDATE leave_requests

            SET status = %s

            WHERE id = %s
            """,

            (
                status,
                leave_id
            )
        )


        db.commit()


        return jsonify({
            "success": True,
            "message": f"Leave {status.lower()} successfully"
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


    finally:

        try:
            cursor.close()
            db.close()
        except:
            pass



@app.route("/api/leaves", methods=["GET"])
def all_leaves_admin():
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM leave_requests ORDER BY created_at DESC")
        return jsonify({"success": True, "requests": cursor.fetchall()})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        try: cursor.close(); db.close()
        except: pass

# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    print("")
    print("======================================")
    print("       DAYFLOW HRMS BACKEND")
    print("======================================")
    print("Server : http://127.0.0.1:5000")
    print("Health : http://127.0.0.1:5000/api/health")
    print("======================================")
    print("")


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
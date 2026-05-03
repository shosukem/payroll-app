import { NextRequest, NextResponse } from "next/server";
import { executeRawSql } from "@/lib/db";

const CREATE_EMPLOYEES_TABLE = `
  IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees')
  BEGIN
    CREATE TABLE employees (
      id INT IDENTITY(1,1) PRIMARY KEY,
      employee_code NVARCHAR(20) NOT NULL UNIQUE,
      last_name NVARCHAR(50) NOT NULL,
      first_name NVARCHAR(50) NOT NULL,
      last_name_kana NVARCHAR(50),
      first_name_kana NVARCHAR(50),
      email NVARCHAR(100),
      department NVARCHAR(100),
      position NVARCHAR(100),
      hire_date DATE NOT NULL,
      birth_date DATE,
      base_salary INT NOT NULL DEFAULT 0,
      position_allowance INT DEFAULT 0,
      commute_allowance INT DEFAULT 0,
      housing_allowance INT DEFAULT 0,
      dependents INT DEFAULT 0,
      is_active BIT DEFAULT 1,
      health_insurance_grade INT DEFAULT 1,
      pension_grade INT DEFAULT 1,
      created_at DATETIME DEFAULT GETDATE(),
      updated_at DATETIME DEFAULT GETDATE()
    );
  END
`;

const CREATE_PAYROLL_RECORDS_TABLE = `
  IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payroll_records')
  BEGIN
    CREATE TABLE payroll_records (
      id INT IDENTITY(1,1) PRIMARY KEY,
      employee_id INT NOT NULL REFERENCES employees(id),
      year INT NOT NULL,
      month INT NOT NULL,
      payment_date DATE,
      base_salary INT NOT NULL,
      overtime_hours NUMERIC(5, 2) DEFAULT 0,
      overtime_pay INT DEFAULT 0,
      late_night_hours NUMERIC(5, 2) DEFAULT 0,
      late_night_pay INT DEFAULT 0,
      holiday_hours NUMERIC(5, 2) DEFAULT 0,
      holiday_pay INT DEFAULT 0,
      position_allowance INT DEFAULT 0,
      commute_allowance INT DEFAULT 0,
      housing_allowance INT DEFAULT 0,
      other_allowance INT DEFAULT 0,
      total_earnings INT NOT NULL,
      health_insurance INT DEFAULT 0,
      nursing_insurance INT DEFAULT 0,
      pension_insurance INT DEFAULT 0,
      employment_insurance INT DEFAULT 0,
      social_insurance_total INT DEFAULT 0,
      income_tax INT DEFAULT 0,
      resident_tax INT DEFAULT 0,
      other_deduction INT DEFAULT 0,
      total_deductions INT NOT NULL,
      net_pay INT NOT NULL,
      memo NVARCHAR(MAX),
      created_at DATETIME DEFAULT GETDATE(),
      UNIQUE(employee_id, year, month)
    );
  END
`;

const CREATE_EMPLOYEE_FILES_TABLE = `
  IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employee_files')
  BEGIN
    CREATE TABLE employee_files (
      id INT IDENTITY(1,1) PRIMARY KEY,
      employee_id INT NOT NULL REFERENCES employees(id),
      file_name NVARCHAR(255) NOT NULL,
      blob_name NVARCHAR(500) NOT NULL,
      content_type NVARCHAR(100),
      file_size INT,
      category NVARCHAR(50),
      memo NVARCHAR(500),
      uploaded_by NVARCHAR(100),
      uploaded_at DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX ix_employee_files_employee_id ON employee_files(employee_id);
  END
`;

const CREATE_BONUS_RECORDS_TABLE = `
  IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bonus_records')
  BEGIN
    CREATE TABLE bonus_records (
      id INT IDENTITY(1,1) PRIMARY KEY,
      employee_id INT NOT NULL REFERENCES employees(id),
      year INT NOT NULL,
      bonus_type NVARCHAR(20) NOT NULL,
      payment_date DATE,
      base_amount INT NOT NULL,
      performance_rate NUMERIC(4, 2) DEFAULT 1.00,
      total_amount INT NOT NULL,
      health_insurance INT DEFAULT 0,
      nursing_insurance INT DEFAULT 0,
      pension_insurance INT DEFAULT 0,
      employment_insurance INT DEFAULT 0,
      social_insurance_total INT DEFAULT 0,
      income_tax INT DEFAULT 0,
      total_deductions INT NOT NULL,
      net_pay INT NOT NULL,
      memo NVARCHAR(MAX),
      created_at DATETIME DEFAULT GETDATE(),
      UNIQUE(employee_id, year, bonus_type)
    );
  END
`;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.DB_INIT_SECRET || "secret"}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await executeRawSql(CREATE_EMPLOYEES_TABLE);
    await executeRawSql(CREATE_PAYROLL_RECORDS_TABLE);
    await executeRawSql(CREATE_BONUS_RECORDS_TABLE);
    await executeRawSql(CREATE_EMPLOYEE_FILES_TABLE);

    return NextResponse.json({
      message: "Database tables initialized successfully",
      tables: ["employees", "payroll_records", "bonus_records", "employee_files"],
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}

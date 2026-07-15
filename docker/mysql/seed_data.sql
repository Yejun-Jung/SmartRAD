USE tp_hr;

-- 부서 데이터 삽입
INSERT IGNORE INTO department (department_id, department_name, active, deleted, created_at) VALUES 
(1, '개발팀', true, false, CURRENT_TIMESTAMP),
(2, '디자인팀', true, false, CURRENT_TIMESTAMP),
(3, '마케팅팀', true, false, CURRENT_TIMESTAMP),
(4, '인사팀', true, false, CURRENT_TIMESTAMP),
(5, '기획팀', true, false, CURRENT_TIMESTAMP);

-- 직급 데이터 삽입
INSERT IGNORE INTO position (position_id, position_name, level, active, deleted, created_at) VALUES 
(1, '사원', 1, true, false, CURRENT_TIMESTAMP),
(2, '주임', 2, true, false, CURRENT_TIMESTAMP),
(3, '대리', 3, true, false, CURRENT_TIMESTAMP),
(4, '과장', 4, true, false, CURRENT_TIMESTAMP),
(5, '차장', 5, true, false, CURRENT_TIMESTAMP),
(6, '부장', 6, true, false, CURRENT_TIMESTAMP);

-- 고용 형태 데이터 삽입
INSERT IGNORE INTO employment_type (employment_type_id, employment_type_name, active, deleted, created_at) VALUES 
(1, '정규직', true, false, CURRENT_TIMESTAMP),
(2, '계약직', true, false, CURRENT_TIMESTAMP),
(3, '인턴', true, false, CURRENT_TIMESTAMP);

-- 기존 직원들에게 부서, 직급, 고용 형태, 계좌 정보 업데이트
UPDATE employee SET department_id = 1, position_id = 3, employment_type_id = 1, bank_name = '국민은행', account_number = '111-222-333333', account_holder = name WHERE employee_no = 'EMP003';
UPDATE employee SET department_id = 2, position_id = 2, employment_type_id = 1, bank_name = '신한은행', account_number = '444-555-666666', account_holder = name WHERE employee_no = 'EMP004';
UPDATE employee SET department_id = 3, position_id = 4, employment_type_id = 1, bank_name = '우리은행', account_number = '777-888-999999', account_holder = name WHERE employee_no = 'EMP005';
UPDATE employee SET department_id = 4, position_id = 1, employment_type_id = 2, bank_name = '하나은행', account_number = '123-456-789012', account_holder = name WHERE employee_no = 'EMP006';
UPDATE employee SET department_id = 5, position_id = 5, employment_type_id = 1, bank_name = '카카오뱅크', account_number = '3333-44-5555555', account_holder = name WHERE employee_no = 'EMP007';

-- 초기 더미 관리자 및 기존 직원 데이터에도 일부 세팅
UPDATE employee SET department_id = 1, position_id = 6, employment_type_id = 1, bank_name = '토스뱅크', account_number = '1000-2222-3333' WHERE employee_no = 'ADMIN001';
UPDATE employee SET department_id = 1, position_id = 1, employment_type_id = 1 WHERE employee_no = 'EMP001';
UPDATE employee SET department_id = 2, position_id = 3, employment_type_id = 1 WHERE employee_no = 'EMP002';

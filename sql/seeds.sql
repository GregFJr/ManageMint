USE employee_db;

-- Insert Into Department Table
INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ('Finance');
INSERT INTO department (name) VALUES ('Sales');

-- Insert Into Role Table
INSERT INTO role (title, salary, department_id) VALUES ('Engineer', 80000, 1);
INSERT INTO role (title, salary, department_id) VALUES ('Financial Analyst', 70000, 2);
INSERT INTO role (title, salary, department_id) VALUES ('Salesperson', 60000, 3);

-- Insert Into Employee Table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Jane', 'Doe', 2, 1);

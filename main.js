const mysql = require('mysql2');
const inquirer = require('inquirer');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'brolic2337',
  database: 'employee_db'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  mainMenu();
});

async function mainMenu() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Exit']
  });

  switch (action) {
    case 'View All Departments':
      viewAllDepartments();
      break;
    case 'View All Roles':
      viewAllRoles();
      break;
    case 'View All Employees':
      viewAllEmployees();
      break;
    case 'Add a Department':
      addDepartment();
      break;
    case 'Add a Role':
      addRole();
      break;
    case 'Add an Employee':
      addEmployee();
      break;
    case 'Update an Employee Role':
      updateEmployeeRole();
      break;
    case 'Exit':
      connection.end();
      break;
  }
}

// Function to view all departments
function viewAllDepartments() {
  connection.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

// Function to view all roles
function viewAllRoles() {
  connection.query('SELECT * FROM role', (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

// Function to view all employees
function viewAllEmployees() {
  connection.query('SELECT * FROM employee', (err, res) => {
    if (err) throw err;
    console.table(res);
    mainMenu();
  });
}

// Function to add a department
async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    type: 'input',
    name: 'departmentName',
    message: 'What is the name of the new department?',
    validate: input => {
      if (input) {
        return true;
      }
      return 'Please provide a department name.';
    }
  });

  connection.query('INSERT INTO department SET ?', { name: departmentName }, (err, res) => {
    if (err) throw err;
    console.log(`${res.affectedRows} department inserted!\n`);
    mainMenu();
  });
}


// Function to add a role
async function addRole() {
  connection.query('SELECT * FROM department', async (err, departments) => {
    if (err) throw err;

    const departmentChoices = departments.map(({ id, name }) => ({
      name: name,
      value: id
    }));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'roleTitle',
        message: 'What is the title of the new role?',
        validate: input => {
          if (input) {
            return true;
          }
          return 'Please provide a role title.';
        }
      },
      {
        type: 'input',
        name: 'roleSalary',
        message: 'What is the salary of the new role?',
        validate: input => {
          const valid = !isNaN(parseFloat(input));
          return valid || 'Please provide a valid salary.';
        }
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department does this role belong to?',
        choices: departmentChoices
      }
    ]);

    connection.query('INSERT INTO role SET ?', {
      title: answers.roleTitle,
      salary: answers.roleSalary,
      department_id: answers.departmentId
    }, (err, res) => {
      if (err) throw err;
      console.log(`${res.affectedRows} role inserted!\n`);
      mainMenu();
    });
  });
}


// Function to add an employee
async function addEmployee() {
  const [roles, managers] = await Promise.all([
    new Promise((resolve, reject) => {
      connection.query('SELECT * FROM role', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    }),
    new Promise((resolve, reject) => {
      connection.query('SELECT * FROM employee', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    })
  ]);

  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const managerChoices = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'What is the employee\'s first name?',
      validate: input => {
        if (input) {
          return true;
        }
        return 'Please provide a first name.';
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'What is the employee\'s last name?',
      validate: input => {
        if (input) {
          return true;
        }
        return 'Please provide a last name.';
      }
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'What is the employee\'s role?',
      choices: roleChoices
    },
    {
      type: 'list',
      name: 'managerId',
      message: 'Who is the employee\'s manager?',
      choices: managerChoices
    }
  ]);

  connection.query('INSERT INTO employee SET ?', {
    first_name: answers.firstName,
    last_name: answers.lastName,
    role_id: answers.roleId,
    manager_id: answers.managerId || null
  }, (err, res) => {
    if (err) throw err;
    console.log(`${res.affectedRows} employee inserted!\n`);
    mainMenu();
  });
}


// Function to update an employee role
async function updateEmployeeRole() {
    const [employees, roles] = await Promise.all([
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM employee', (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        }
        ),
        new Promise((resolve, reject) => {
            connection.query('SELECT * FROM role', (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        }
        )
    ]);

    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Which employee\'s role do you want to update?',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Which role do you want to assign the selected employee?',
            choices: roleChoices
        },
    ]);

    connection.query('UPDATE employee SET ? WHERE ?',
        [
            {
                role_id: answers.roleId
            },
            {
                id: answers.employeeId
            }
        ],
        (err, res) => {
            if (err) throw err;
            console.log(`${res.affectedRows} employee updated!\n`);
            mainMenu();
        }
    );

}

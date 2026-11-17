# Personal Task Manager

A full-stack web application that helps users organize, manage, and track their daily tasks.

## Project Overview

Personal Task Manager is a web-based application developed to make task management simple and efficient. Users can create an account, securely log in, add tasks, update task details, track deadlines, and manage their task completion status.

The application provides a dashboard with task statistics, search functionality, and filters to help users keep track of their work.

## Key Features

- User registration and login
- Secure password hashing
- JWT-based authentication
- Create, edit, and delete tasks
- Mark tasks as Pending or Completed
- Set optional task descriptions and deadlines
- Track overdue tasks and remaining days
- Automatic sorting based on deadlines
- Search tasks by title
- Filter tasks by completion status
- Dashboard with task statistics
- User-specific task management
- Responsive design for mobile, tablet, and desktop

## Technology Stack

### Frontend
- React.js – Building the user interface
- Vite – Frontend development and build tool
- HTML5 – Application structure
- CSS3 – Styling and responsive design
- JavaScript – Application functionality

### Backend
- Node.js – JavaScript runtime environment
- Express.js – Backend API development
- JWT (JSON Web Token) – User authentication
- bcrypt – Password hashing

### Database
- MySQL – Storing user accounts and task information
- mysql2 – Connecting the backend to MySQL

### Development Tools
- Visual Studio Code – Code editor
- Git – Version control
- GitHub – Source code hosting
- Prettier – Code formatting

## Project Structure

Personal-Task-Manager/
│
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── .prettierrc
└── README.md

## Database Structure

The application uses MySQL to store user account information and task details.

### 1. Users Table

Stores registered user information.

| Column | Description |
|---|---|
| id | Unique user ID |
| name | User's name |
| email | User's email address |
| password | Bcrypt-hashed password |

### 2. Tasks Table

Stores tasks created by users.

| Column | Description |
|---|---|
| id | Unique task ID |
| title | Task title |
| description | Optional task description |
| due_date | Optional task deadline |
| status | Pending or Completed |
| created_at | Task creation timestamp |
| user_id | ID of the user who owns the task |

### Database Relationship

- One user can create multiple tasks.
- Each task belongs to one user.
- The `user_id` column connects the Tasks table with the Users table.
- User-specific task access is enforced through backend authentication.

## Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Gokul9656/Personal-Task-Manager.git
cd Personal-Task-Manager
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory using `.env.example` as a reference.

Configure the following environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=personal_task_manager
```

Replace `your_mysql_password` with your local MySQL password.

### 3. Database Setup

Open MySQL and create the database:

```sql
CREATE DATABASE personal_task_manager;
```

Create the required `users` and `tasks` tables using the database schema provided in the project.

### 4. Start the Backend Server

From the backend directory, run:

```bash
node server.js
```

The backend server runs at:

http://localhost:5000

### 5. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the application in your browser:

http://localhost:5173

## Testing

The application was tested across the following areas:

- User registration and login
- Authentication and session management
- Task creation, editing, deletion, and status updates
- Task search and filtering
- Deadline tracking and overdue detection
- Deadline-based task sorting
- Data persistence after refresh and login
- Multi-user data isolation
- API authentication and access protection
- Input validation and error handling
- Application startup and responsive design

All 41 manually performed test cases passed during final testing.

## Security Features

- Passwords are hashed using bcrypt before being stored.
- JWT-based authentication protects private API routes.
- Protected endpoints reject missing and invalid authentication tokens.
- Each user can access only their own tasks.
- Registration and login inputs are validated.
- Environment variables are used for database configuration.
- Sensitive configuration files are excluded from Git using `.gitignore`.
-

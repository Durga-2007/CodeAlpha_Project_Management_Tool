# TaskFlow – Collaborative Project Management Tool

TaskFlow is a modern, real-time collaborative project management application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

## Features

- **🔐 Robust Authentication**: JWT-based auth with secure password hashing (Bcrypt).
- **📊 Kanban Board System**: Manage tasks across 'Todo', 'In Progress', and 'Done' columns with drag-and-drop.
- **📁 Project Management**: Create projects, add members, and manage team workspaces.
- **📝 Task Details**: Set priorities, due dates, assignments, and detailed descriptions.
- **💬 Real-time Comments**: Instant collaboration inside task cards.
- **🔔 Real-time Notifications**: Get notified instantly when tasks are assigned, moved, or commented on.
- **🎨 Premium UI**: Modern, responsive design using Tailwind CSS with smooth animations.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Axios, React Router, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Socket.io.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed (locally or MongoDB Atlas)

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your configurations:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token

### Projects
- `GET /api/projects` - Get all projects for current user
- `POST /api/projects` - Create a new project
- `DELETE /api/projects/:id` - Delete a project (admin/creator)

### Tasks
- `GET /api/tasks/:projectId` - Get tasks for a specific project
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task (move columns, edit details)
- `DELETE /api/tasks/:id` - Delete a task

### Comments
- `GET /api/comments/:taskId` - Get all comments for a task
- `POST /api/comments` - Add a new comment
- `DELETE /api/comments/:id` - Delete a comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

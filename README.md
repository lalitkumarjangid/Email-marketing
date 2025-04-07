# 📧 Email Marketing Sequence Builder

A full-stack application that allows users to visually create and schedule email marketing sequences using a drag-and-drop flowchart. Built with **MERN Stack** and **React Flow**, and powered by **Agenda** and **Nodemailer** for backend scheduling.

## 🔗 Live Demo
- **Frontend:** [https://marketingxyz.vercel.app/](https://marketingxyz.vercel.app/)

---

## 📁 Folder Structure


---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB URI (local or cloud)
- [Optional] Nodemailer SMTP credentials (e.g., Gmail, Mailtrap)

---

## 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Runs the React app at: http://localhost:5173

⚙️ Built with Vite, React, Tailwind CSS, React Flow

🔧 Backend Setup
```bash
cd server
npm install
```
````bash

npm run dev
```
Runs the backend on: http://localhost:5000

Uses Nodemailer for sending emails and Agenda.js for scheduling tasks.
````
📦 API Endpoint
[POST] /api/schedule
Description: Schedules an email to be sent after 1 hour.
```
Request Body:
json
{
  "to": "recipient@example.com",
  "subject": "Your Subject",
  "body": "Email Body Content",
  "time": "2025-04-07T10:00:00Z"  // ISO string format
}
````
✅ Features
Drag & Drop Email Sequence Builder (React Flow)

Save and Load Sequences

Schedule Emails using Delay Nodes

Backend Scheduling with Agenda

Email Sending via Nodemailer

Vercel (Frontend) & Render (Backend) Deployable

📄 License

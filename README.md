
# Hi, I'm Yash Jain! 👋


## 🚀 About Me
I am a passionate and driven Full Stack Web Developer and Python Programmer with a strong foundation in building dynamic, user-centric applications. With expertise in both front-end and back-end development, I am committed to creating seamless and scalable solutions. I thrive on challenges and consistently seek opportunities to expand my knowledge and skills in emerging technologies. My approach combines hard work, attention to detail, and a dedication to continuous learning, allowing me to contribute effectively to any project and deliver high-quality results.




## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://portfolio-86j1.onrender.com/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yash-jain-47b043276/)



# 🏥 Clinic Management System

The Clinic Management System is a web-based healthcare solution that simplifies clinic workflows and improves coordination between receptionists and doctors. It manages patient information, prescription history, billing, and token generation, all stored securely in Firebase. Designed for ease of use, this system automates many repetitive tasks and reduces administrative overhead.

## 🚀 Features

### 👨‍⚕️ Doctor
- Secure login
- Access complete patient records including historical data
- View patient details received from the receptionist
- Enter prescriptions into the system after consultation
- All actions are logged for traceability

### 🧑‍💼 Receptionist
- Secure login
- Automatically generate token numbers for visiting patients
- Enter and update patient personal information
- View doctor-assigned prescriptions
- Generate billing advice for patients
- Maintain access to all historical records
- Initiate communication and synchronize with doctors

## Tech Stack

**Client:** React, Context, TailwindCSS

**Server:** Firebase (Authentication, Firestore, Realtime Database)


## Run Locally

Clone the project

```bash
  git clone https://github.com/yash-k-jain/clinic-management-system
```

Go to the project directory

```bash
  cd gym-management-system
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

# 🔄 GYM Management System – Workflow

This document outlines the step-by-step workflows for the three primary user roles:
1. Admin
2. Member
3. General User

---

## 🧑‍💼 1. Admin Workflow

### 🔐 Login
- Enters credentials and submits.
- If valid:
  - Redirect to Admin Dashboard.
  - Log the login event.

### 👥 Add Member
- Enter details: Name, Contact, Membership Plan, Start Date.
- Submit form:
  - Validate input.
  - Save to Firebase.
  - Log creation event.

### 🛠️ Update/Edit Member
- Search or select member.
- Click “Edit” to update member info.
- Save changes:
  - Update Firebase record.
  - Log the update action.

### 💊 Add Supplement
- Enter details: Name, Description, Price, Stock.
- Submit to add to catalog.
- Log the addition event.

### 🧾 Create Bill
- Select member and membership plan.
- Auto-calculate amount due.
- Submit to generate bill:
  - Save bill to Firebase.
  - Notify member.
  - Log billing action.

### 👓 View Bills
- View all or filtered by member/date/status.
- Export as report (PDF/CSV).
- Log access to billing data.

### 📊 View Report
- View:
  - Active vs expired members
  - Monthly income
  - Most popular supplements
- Log report view event.

### 🔔 Send Notification (Expiring Memberships)
- System fetches members with memberships ending in next 7 days.
- Admin can send:
  - Email / In-app notification.
  - “Your membership ends on [Date]. Renew soon.”
- Log each notification sent.

---

## 🧍‍♂️ 2. Member Workflow

### 🔐 Login
- Submits email/password.
- If valid:
  - Redirect to Member Dashboard.
  - Log login action.

### 🗂️ View Current Membership
- Dashboard displays:
  - Active plan
  - Start & End Dates
  - Fee status (paid/pending)
- Pull data from Firebase.

### 📜 View Payment & Activity History
- See:
  - Past bills
  - Payment receipts
  - Notifications received
- Log history view.

---

## 🌐 3. General User Workflow

### 👀 View Supplement Store
- Browse:
  - Product names, descriptions, prices
- No login required.

### 🏠 View Public Website
- View:
  - About the Gym
  - Services
  - Contact info
  - Membership plans
- Open to all visitors.

---

## 📌 Notes
- All user actions (login, create, update, etc.) are logged using Winston.
- Firebase is used for real-time data storage and access.
- Supplement module is accessible to both admin and general users (view-only for general).



## Admin Credentials

Email - admin@gmail.com\
password - 123456

After login, create the member and can see members POV.
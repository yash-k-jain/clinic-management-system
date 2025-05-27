
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
  cd clinic-management-system
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

# 🔄 Clinic Management System – Workflow

This document outlines the step-by-step workflows for the three primary user roles:
1. Doctor
2. Receptionist

---

## 🧑‍💼 1. Receptionist Workflow

### 🔐 Login
- Enters credentials and submits.
- If valid:
  - Redirect to Home Page.
  - Log the login event.

### 🆕 Register New Patient
- Input fields: Name, Contact Info, Age.
- System auto-generates a unique token number.
- Submit form:
  - Validate input.
  - Save to Firebase.
  - Log creation event.

### 📋 View Patient Queue
- List of patients sorted by token number.
- Displays basic info (Name, Token, Status).
- Save changes:
  - Update Firebase record.
  - Log the update action.

### 🧾 Generate Bill
- Receive doctor’s prescription and consultation charges.
- Add any extra service fees (if applicable).
- Generate and store bill in Firebase.
- Notify patient of charges.
- Log billing event.

### 📜 Access Patient History
- Search by patient name or ID.
- View all past visits, prescriptions, and bills.

---

## 👨‍⚕️ 2. Doctor Workflow

### 🔐 Login
- Submits email/password.
- If valid:
  - Redirect to Member Dashboard.
  - Log login action.

### 📥 View Assigned Patients
- See a list of patients forwarded by the receptionist.
- Displays token number, name, and symptoms.

### 📝 Write Prescription
- Enter diagnosis and prescribed medication.
- Submit prescription:
  - Save to Firebase.
  - Log prescription creation.

### 📚 View Patient History
- Option to access all previous prescriptions and consultations.
- Helps in making informed medical decisions.

---

## 📌 Notes
- All user actions (login, create, update, etc.) are logged using log-level.
- Firebase is used for real-time data storage and access.

---

## 📦 System Characteristics
- 🔐 Modular, safe, and secure code
- 🧪 Easily testable and maintainable
- 💡 Platform independent (portable)
- 📝 Logged activities using JS log-level logging
- ✅ Follows coding standards and design guidelines

---

## Admin Credentials

Login as random clinic and receptionist emails.
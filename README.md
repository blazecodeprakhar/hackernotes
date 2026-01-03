# �️‍♂️ HackerNotes | Secure Terminal

[![Main Website](https://img.shields.io/badge/Main_Website-prakharcodes-blue?style=for-the-badge&logo=google-chrome)](https://prakharcodes.netlify.app/)
[![Project Status](https://img.shields.io/badge/System-Operational-green?style=for-the-badge&logo=mongodb)]( # )

**HackerNotes** is an advanced, terminal-themed note-taking application designed for privacy and security simulation. It features a dual-layer interface with public logs and a cryptic **Secure Vault** for sensitive data, wrapped in a responsive "Matrix-style" UI.

---

## 🚀 Key Features

### 🔐 Secure Vault System
-   **Dual Database**: Separates public logs from encrypted private notes.
-   **Authentication**: Custom logic for Passcode setup, Login validation, and Security Question recovery.
-   **Red Alert Mode**: UI transforms to indicate a secure, active session.

### 📡 User Intelligence & Tracking
-   **Session Scanning**: Automatically detects user's **IP Address, ISP, Device Type, and OS** upon login.
-   **Stealth Reporting**: Integrates with **Web3Forms** to silently email session details and vault activity to the administrator.
-   **Identity Verification**: Mandatory "Quick Login" modal to establish user identity before access.

### 💻 Hacker UI/UX
-   **Terminal Aesthetic**: Monospace fonts (`Share Tech Mono`), neon green accents, and glass-terminal effects.
-   **Responsive Design**: Mobile-ready with a slide-out command sidebar and touch-optimized controls.
-   **Real-time Interactions**: Toast notifications, typing effects, and auto-expanding input fields.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript | Custom "Hacker" CSS theme, DOM manipulation. |
| **Backend** | Node.js, Express.js | REST API handling Public & Private routes. |
| **Database** | MongoDB (Mongoose) | Stores Notes, Vault Configs, and Logs. |
| **Telemetry** | IPAPI & Web3Forms | For location tracking and email notifications. |

---

## ⚡ Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) installed.
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/blazecodeprakhar/hackernotes.git]
    cd hackernotes
    ```

2.  **Install Cyber-Dependencies**
    ```bash
    npm install
    ```

3.  **Initiate System**
    ```bash
    npm start
    ```
    > Terminal Output: `🚀 Server is running on http://localhost:3000`

4.  **Access Terminal**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## � Project Structure

```bash
HackerNotes/
├── public/
│   ├── index.html       # Main Terminal Interface
│   ├── style.css        # Hacker Theme & Responsiveness
│   └── script.js        # Logic: Vault, Tracking, API
├── server.js            # Backend Core & Database Models
├── package.json         # Dependencies
└── README.md            # System Manual
```

---

## 🔗 Links

-   **👨‍💻 Developer Portfolio**: [https://prakharcodes.netlify.app/](https://prakharcodes.netlify.app/)
-   **🔴 Live Demo**: [Here](https://hackernotes.onrender.com/)

---

<p align="center">
  <i>"Security is just an illusion."</i><br>
  Built for educational purposes.
</p>

# 🚀 Cyber Suraksha OPS – MSME Cybersecurity Training Simulator

**Team Infinity — SciTech Innovation Hackathon 2025 (Round 2 Submission)**

A next-generation cybersecurity awareness and attack-simulation platform designed for **India’s MSMEs** to train against real-world cyber threats in a safe, guided, and affordable environment.



---

## 🛡 Problem Statement (PS 6.2): Vulnerability Red-Teaming Simulator for MSMEs

MSMEs lack access to cybersecurity testing due to cost and expertise gaps. Most enterprises never perform vulnerability assessments until a breach occurs.

**Why It Matters**
- ~60% of MSMEs experienced cyber incidents (Assocham 2024).  
- Avg. loss per breach ≈ **₹12 lakh**.  
- Low awareness and limited access to cyber-range facilities.

**Goal**  
Provide a safe, low-cost simulation environment to train MSMEs to identify, respond to, and prevent common cyberattacks.

---

## ⭐ What is Cyber Suraksha OPS?

Interactive, AI-assisted training platform with:
- Realistic attack simulations (Phishing, Weak Passwords, Malware, SQLi, Ransomware, Social Engineering)
- AI Chat Assistant (Hinglish-friendly)
- Automatic scoring and vulnerability dashboard
- Downloadable PDF report
- Auto-generated completion certificate

---

## 🧩 Key Features

- **Phishing Simulation** — Identify malicious emails and red flags  
- **Password Strength Simulation** — Visualize brute-force risk and best practices  
- **Malware Detection** — Spot suspicious file types and unsafe actions  
- **SQL Injection Demo** — Understand query manipulation and prevention  
- **Ransomware Walkthrough** — See impact, decisions (pay / don’t pay), and recovery best practices  
- **Social Engineering Scenarios** — Phone/email/WhatsApp impersonation exercises  
- **AI Suraksha Bot** — Live Q&A, explanations, and remediation tips  
- **PDF Report & Certificate** — Professional report & completion certificate

---

---

## 🛠 Tech Stack

**Frontend:** React (Vite), Tailwind, React Router, Lucide icons, Sonner  
**Backend:** FastAPI, Motor (MongoDB), OpenAI SDK, ReportLab (PDF)

---
**Live Demo:**  
https://cyber-suraksha-a4l9n6u6t-atharvadubeyofficials-projects.vercel.app/

## 🔧 Local Run Instructions (For Judges)

> Clone the repository and run backend and frontend locally. Use these exact steps.

### 1. Clone
```bash
git clone https://github.com/atharvadubeyofficial/Cyber-Suraksha-.git
cd Cyber-Suraksha-
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000


- cd frontend
npm install
npm run dev

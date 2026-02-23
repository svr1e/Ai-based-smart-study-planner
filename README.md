# 🎓 AI Study Planner

An AI-powered study planner built with **Spring Boot**, **MongoDB**, **React**, and **Google Gemini API**.

## ✨ Features

- 📄 **Upload Study Materials** — PDF, TXT, MD files with AI text extraction
- 🗓️ **Auto-Generate Study Schedule** — Gemini creates a personalized day-by-day plan
- 🧠 **AI Quiz Generator** — Auto-generates MCQs from your uploaded material
- 💬 **Ask AI** — Chat with Gemini about your material, get answers & summaries
- 📊 **Progress Tracking** — Visual dashboard with completion stats
- ⏰ **Smart Reminders** — Email reminders sent daily at 8AM for your sessions

---

## 🛠️ Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java | 17+ | https://adoptium.net/ |
| Maven | 3.8+ | https://maven.apache.org/ |
| Node.js | 18+ | https://nodejs.org/ |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |

---

## ⚡ Quick Start

### Step 1 — Get Your Gemini API Key
1. Go to https://aistudio.google.com
2. Click **Get API Key → Create API Key**
3. Copy your key

### Step 2 — Configure the Backend
Open `backend/src/main/resources/application.properties` and replace:
```
gemini.api.key=YOUR_GEMINI_API_KEY_HERE
```
With your actual key.

Also set up email (for reminders):
```
spring.mail.username=your@gmail.com
spring.mail.password=your_gmail_app_password
```
> For Gmail app password: https://myaccount.google.com/apppasswords

### Step 3 — Start MongoDB
```bash
# Mac/Linux
mongod

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

### Step 4 — Run the App

**Windows:**
```bash
setup.bat    # First time only
start.bat    # Every time
```

**Mac/Linux:**
```bash
chmod +x setup.sh start.sh
./setup.sh   # First time only
./start.sh   # Every time
```

**Manual (IntelliJ):**
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### Step 5 — Open the App
Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
ai-study-planner/
├── backend/                          Spring Boot API
│   └── src/main/java/com/studyplanner/
│       ├── model/                    MongoDB documents
│       ├── repository/               MongoDB repositories
│       ├── service/                  Business logic + Gemini API
│       ├── controller/               REST endpoints
│       ├── config/                   Security config
│       └── dto/                      Request/Response DTOs
│
└── frontend/                         React + Vite
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx         Progress overview
        │   ├── Upload.jsx            Upload materials
        │   ├── Planner.jsx           Study schedule
        │   ├── Quiz.jsx              AI quiz
        │   └── Chat.jsx              Ask AI
        ├── components/Layout.jsx     Navigation sidebar
        ├── services/api.js           Axios API calls
        └── context/AuthContext.jsx   Auth state
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/materials/upload | Upload + extract PDF |
| POST | /api/materials/{id}/ask | Ask AI question |
| POST | /api/materials/{id}/quiz | Generate quiz |
| POST | /api/materials/{id}/summarize | Summarize material |
| POST | /api/plans/generate | AI-generate study plan |
| GET | /api/plans/user/{userId} | Get user's plans |
| PATCH | /api/plans/{id}/complete | Mark session done |
| GET | /api/quiz/generate/{materialId} | Generate quiz questions |
| POST | /api/quiz/submit | Submit quiz answers |

---

## 🔧 Troubleshooting

**MongoDB connection failed:**
- Make sure MongoDB is running: `mongod`

**Gemini API error:**
- Check your API key in `application.properties`
- Ensure you have internet access
- Free tier has rate limits — wait a moment and retry

**Email reminders not sending:**
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use App Passwords

**Frontend can't reach backend:**
- Ensure backend is running on port 8080
- Check no firewall blocking the port

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js |
| Backend | Spring Boot 3.2, Java 17 |
| Database | MongoDB |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (JJWT) |
| PDF | Apache PDFBox |
| Email | Spring Mail (SMTP) |

# 📓 College Work Diary — Flask Backend

A REST API backend for the College Work Done Diary app.
Built with Python + Flask + PostgreSQL (GCP Cloud SQL).

---

## 📁 Project Structure

```
diary-backend/
├── run.py                  ← Start the server
├── config.py               ← DB and app settings
├── requirements.txt        ← Python packages
├── .env.example            ← Environment variable template
└── app/
    ├── __init__.py         ← App factory
    ├── models/
    │   └── models.py       ← Database tables (User, DiaryEntry, etc.)
    └── routes/
        ├── auth.py         ← Login, Register, Profile
        ├── entries.py      ← Create/Read/Update/Delete diary entries
        ├── dashboard.py    ← Stats and reports
        └── users.py        ← User management (Admin only)
```

---

## ⚙️ Setup Instructions

### 1. Install Python packages
```bash
pip install -r requirements.txt
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create PostgreSQL database (GCP Cloud SQL)
```sql
CREATE DATABASE college_diary;
```

### 4. Run the server
```bash
python run.py
```
Server starts at: http://localhost:5000

---

## 🔗 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT token |
| GET | /api/auth/me | Get current user profile |
| PUT | /api/auth/change-password | Change password |

### 📖 Diary Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/entries/ | Create new diary entry |
| GET | /api/entries/ | Get all entries (role-filtered) |
| GET | /api/entries/<id> | Get single entry |
| PUT | /api/entries/<id> | Update entry |
| DELETE | /api/entries/<id> | Delete entry |

### 📊 Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Summary statistics |
| GET | /api/dashboard/syllabus-report | Syllabus progress per subject |

### 👥 Users (Admin/Principal Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/ | List all users |
| PUT | /api/users/<id> | Update user role/department |
| DELETE | /api/users/<id> | Delete user |

---

## 🔑 How Authentication Works

1. User logs in → server returns a **JWT Token**
2. Frontend stores this token
3. Every API call must include the token in the header:
```
Authorization: Bearer <your_token_here>
```

---

## 👥 Role Permissions

| Action | Teacher | HOD | Admin | Principal |
|--------|---------|-----|-------|-----------|
| Add own entry | ✅ | ✅ | ✅ | ✅ |
| View own entries | ✅ | ✅ | ✅ | ✅ |
| View all entries | ❌ | ✅ | ✅ | ✅ |
| Delete any entry | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Delete users | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ Database Tables

```
users          → id, name, email, password, role, department
diary_entries  → id, user_id, date, department, subject, class, syllabus%, remarks
lectures       → id, entry_id, topic, duration, class_name
assignments    → id, entry_id, title, class_name, given, checked
meetings       → id, entry_id, type, duration, agenda
```

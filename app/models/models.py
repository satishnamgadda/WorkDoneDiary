from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


# ─── USER MODEL ──────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(120), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password_hash= db.Column(db.String(256), nullable=False)
    role         = db.Column(db.String(50), nullable=False)   # Teacher / HOD / Admin / Principal
    department   = db.Column(db.String(100))
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    is_active    = db.Column(db.Boolean, default=True)

    # Relationship
    entries = db.relationship("DiaryEntry", backref="author", lazy=True, cascade="all, delete")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "role":       self.role,
            "department": self.department,
            "created_at": self.created_at.isoformat(),
            "is_active":  self.is_active,
        }


# ─── DIARY ENTRY MODEL ───────────────────────────────────────────────────────
class DiaryEntry(db.Model):
    __tablename__ = "diary_entries"

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    date             = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    department       = db.Column(db.String(100), nullable=False)
    subject          = db.Column(db.String(100))
    class_name       = db.Column(db.String(50))           # e.g. SE-A, TE-B
    syllabus_percent = db.Column(db.Integer, default=0)   # 0-100
    remarks          = db.Column(db.Text)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lectures    = db.relationship("Lecture",    backref="entry", lazy=True, cascade="all, delete")
    assignments = db.relationship("Assignment", backref="entry", lazy=True, cascade="all, delete")
    meetings    = db.relationship("Meeting",    backref="entry", lazy=True, cascade="all, delete")

    def to_dict(self):
        return {
            "id":               self.id,
            "user_id":          self.user_id,
            "author_name":      self.author.name if self.author else None,
            "author_role":      self.author.role if self.author else None,
            "date":             self.date.isoformat(),
            "department":       self.department,
            "subject":          self.subject,
            "class_name":       self.class_name,
            "syllabus_percent": self.syllabus_percent,
            "remarks":          self.remarks,
            "lectures":         [l.to_dict() for l in self.lectures],
            "assignments":      [a.to_dict() for a in self.assignments],
            "meetings":         [m.to_dict() for m in self.meetings],
            "created_at":       self.created_at.isoformat(),
        }


# ─── LECTURE MODEL ───────────────────────────────────────────────────────────
class Lecture(db.Model):
    __tablename__ = "lectures"

    id       = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey("diary_entries.id"), nullable=False)
    topic    = db.Column(db.String(200), nullable=False)
    duration = db.Column(db.Integer)    # in minutes
    class_name = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id":         self.id,
            "topic":      self.topic,
            "duration":   self.duration,
            "class_name": self.class_name,
        }


# ─── ASSIGNMENT MODEL ────────────────────────────────────────────────────────
class Assignment(db.Model):
    __tablename__ = "assignments"

    id         = db.Column(db.Integer, primary_key=True)
    entry_id   = db.Column(db.Integer, db.ForeignKey("diary_entries.id"), nullable=False)
    title      = db.Column(db.String(200), nullable=False)
    class_name = db.Column(db.String(50))
    given      = db.Column(db.Boolean, default=False)
    checked    = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id":         self.id,
            "title":      self.title,
            "class_name": self.class_name,
            "given":      self.given,
            "checked":    self.checked,
        }


# ─── MEETING MODEL ───────────────────────────────────────────────────────────
class Meeting(db.Model):
    __tablename__ = "meetings"

    id       = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey("diary_entries.id"), nullable=False)
    type     = db.Column(db.String(100))     # Department Meeting, Workshop, etc.
    duration = db.Column(db.Integer)         # in minutes
    agenda   = db.Column(db.Text)

    def to_dict(self):
        return {
            "id":       self.id,
            "type":     self.type,
            "duration": self.duration,
            "agenda":   self.agenda,
        }

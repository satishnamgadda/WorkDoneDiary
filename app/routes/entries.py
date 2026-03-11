from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import DiaryEntry, Lecture, Assignment, Meeting, User
from datetime import datetime

entries_bp = Blueprint("entries", __name__)


# ─── CREATE ENTRY ─────────────────────────────────────────────────────────────
@entries_bp.route("/", methods=["POST"])
@jwt_required()
def create_entry():
    """
    POST /api/entries/
    Creates a new diary entry with lectures, assignments, meetings
    Body example:
    {
        "date": "2026-03-10",
        "department": "Computer Science",
        "subject": "Data Structures",
        "class_name": "SE-A",
        "syllabus_percent": 65,
        "remarks": "Good session today",
        "lectures": [
            { "topic": "Binary Trees", "duration": 50, "class_name": "SE-A" }
        ],
        "assignments": [
            { "title": "Tree Traversal", "given": true, "checked": false, "class_name": "SE-A" }
        ],
        "meetings": [
            { "type": "Department Meeting", "duration": 45, "agenda": "Exam schedule" }
        ]
    }
    """
    user_id = get_jwt_identity()
    data    = request.get_json()

    # Validate required
    if not data.get("department"):
        return jsonify({"error": "Department is required"}), 400

    # Parse date
    try:
        entry_date = datetime.strptime(data.get("date", str(datetime.utcnow().date())), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Create diary entry
    entry = DiaryEntry(
        user_id          = user_id,
        date             = entry_date,
        department       = data["department"],
        subject          = data.get("subject", ""),
        class_name       = data.get("class_name", ""),
        syllabus_percent = data.get("syllabus_percent", 0),
        remarks          = data.get("remarks", ""),
    )
    db.session.add(entry)
    db.session.flush()  # Get entry.id before committing

    # Add lectures
    for lec in data.get("lectures", []):
        db.session.add(Lecture(
            entry_id   = entry.id,
            topic      = lec.get("topic", ""),
            duration   = lec.get("duration", 0),
            class_name = lec.get("class_name", ""),
        ))

    # Add assignments
    for asn in data.get("assignments", []):
        db.session.add(Assignment(
            entry_id   = entry.id,
            title      = asn.get("title", ""),
            class_name = asn.get("class_name", ""),
            given      = asn.get("given", False),
            checked    = asn.get("checked", False),
        ))

    # Add meetings
    for mtg in data.get("meetings", []):
        db.session.add(Meeting(
            entry_id = entry.id,
            type     = mtg.get("type", ""),
            duration = mtg.get("duration", 0),
            agenda   = mtg.get("agenda", ""),
        ))

    db.session.commit()
    return jsonify({"message": "Entry saved successfully", "entry": entry.to_dict()}), 201


# ─── GET ALL ENTRIES ──────────────────────────────────────────────────────────
@entries_bp.route("/", methods=["GET"])
@jwt_required()
def get_entries():
    """
    GET /api/entries/?date=2026-03-10&department=CS&role=Teacher&page=1&per_page=10
    Returns entries — teachers see only their own; HOD/Admin/Principal see all
    """
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    query = DiaryEntry.query

    # Role-based filtering
    if user.role == "Teacher":
        query = query.filter_by(user_id=user_id)

    # Optional filters
    if request.args.get("date"):
        query = query.filter_by(date=request.args.get("date"))
    if request.args.get("department"):
        query = query.filter_by(department=request.args.get("department"))
    if request.args.get("user_id") and user.role in ["HOD", "College Admin", "Principal"]:
        query = query.filter_by(user_id=request.args.get("user_id"))

    # Pagination
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    paginated = query.order_by(DiaryEntry.date.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "entries":    [e.to_dict() for e in paginated.items],
        "total":      paginated.total,
        "page":       page,
        "per_page":   per_page,
        "total_pages": paginated.pages
    }), 200


# ─── GET SINGLE ENTRY ─────────────────────────────────────────────────────────
@entries_bp.route("/<int:entry_id>", methods=["GET"])
@jwt_required()
def get_entry(entry_id):
    """GET /api/entries/<id>"""
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    entry   = DiaryEntry.query.get_or_404(entry_id)

    # Teachers can only see their own entries
    if user.role == "Teacher" and entry.user_id != int(user_id):
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"entry": entry.to_dict()}), 200


# ─── UPDATE ENTRY ─────────────────────────────────────────────────────────────
@entries_bp.route("/<int:entry_id>", methods=["PUT"])
@jwt_required()
def update_entry(entry_id):
    """PUT /api/entries/<id>"""
    user_id = get_jwt_identity()
    entry   = DiaryEntry.query.get_or_404(entry_id)

    if entry.user_id != int(user_id):
        return jsonify({"error": "You can only edit your own entries"}), 403

    data = request.get_json()
    entry.department       = data.get("department",       entry.department)
    entry.subject          = data.get("subject",          entry.subject)
    entry.class_name       = data.get("class_name",       entry.class_name)
    entry.syllabus_percent = data.get("syllabus_percent", entry.syllabus_percent)
    entry.remarks          = data.get("remarks",          entry.remarks)

    db.session.commit()
    return jsonify({"message": "Entry updated", "entry": entry.to_dict()}), 200


# ─── DELETE ENTRY ─────────────────────────────────────────────────────────────
@entries_bp.route("/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_entry(entry_id):
    """DELETE /api/entries/<id>"""
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    entry   = DiaryEntry.query.get_or_404(entry_id)

    # Only owner or Admin/Principal can delete
    if entry.user_id != int(user_id) and user.role not in ["College Admin", "Principal"]:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted"}), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import DiaryEntry, Lecture, Assignment, Meeting, User
from sqlalchemy import func

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """
    GET /api/dashboard/stats
    Returns summary stats — scoped to role
    """
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    # Base query — scoped by role
    if user.role == "Teacher":
        entries = DiaryEntry.query.filter_by(user_id=user_id).all()
    else:
        entries = DiaryEntry.query.all()

    entry_ids = [e.id for e in entries]

    total_entries      = len(entries)
    total_lectures     = Lecture.query.filter(Lecture.entry_id.in_(entry_ids)).count()
    total_lecture_mins = db.session.query(func.sum(Lecture.duration)).filter(Lecture.entry_id.in_(entry_ids)).scalar() or 0
    total_meetings     = Meeting.query.filter(Meeting.entry_id.in_(entry_ids)).count()
    total_assignments  = Assignment.query.filter(Assignment.entry_id.in_(entry_ids)).count()
    checked_assignments = Assignment.query.filter(Assignment.entry_id.in_(entry_ids), Assignment.checked == True).count()

    avg_syllabus = (
        round(sum(e.syllabus_percent for e in entries) / total_entries)
        if total_entries else 0
    )

    # Department breakdown
    dept_map = {}
    for e in entries:
        dept_map[e.department] = dept_map.get(e.department, 0) + 1

    # Recent 5 entries
    recent = (DiaryEntry.query
              .filter(DiaryEntry.id.in_(entry_ids))
              .order_by(DiaryEntry.date.desc())
              .limit(5).all())

    return jsonify({
        "total_entries":        total_entries,
        "total_lectures":       total_lectures,
        "total_lecture_hours":  round(total_lecture_mins / 60, 1),
        "total_meetings":       total_meetings,
        "total_assignments":    total_assignments,
        "checked_assignments":  checked_assignments,
        "avg_syllabus_percent": avg_syllabus,
        "department_breakdown": dept_map,
        "recent_entries":       [e.to_dict() for e in recent],
    }), 200


@dashboard_bp.route("/syllabus-report", methods=["GET"])
@jwt_required()
def syllabus_report():
    """
    GET /api/dashboard/syllabus-report?department=CS
    Returns syllabus progress per subject per teacher
    """
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    if user.role == "Teacher":
        entries = DiaryEntry.query.filter_by(user_id=user_id).all()
    else:
        dept = request.args.get("department")
        q = DiaryEntry.query
        if dept:
            q = q.filter_by(department=dept)
        entries = q.all()

    # Group by subject — take latest syllabus %
    subject_map = {}
    for e in sorted(entries, key=lambda x: x.date):
        subject_map[e.subject] = {
            "subject":          e.subject,
            "department":       e.department,
            "syllabus_percent": e.syllabus_percent,
            "last_updated":     e.date.isoformat(),
            "teacher":          e.author.name if e.author else "N/A",
        }

    return jsonify({"syllabus_report": list(subject_map.values())}), 200

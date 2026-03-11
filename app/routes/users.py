from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import User

users_bp = Blueprint("users", __name__)


def require_admin(user):
    return user.role in ["College Admin", "Principal"]


@users_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    """GET /api/users/ — Admin/Principal only"""
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    if not require_admin(user):
        return jsonify({"error": "Admin access required"}), 403

    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@users_bp.route("/<int:uid>", methods=["PUT"])
@jwt_required()
def update_user(uid):
    """PUT /api/users/<id> — Update role or department"""
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    if not require_admin(user):
        return jsonify({"error": "Admin access required"}), 403

    target = User.query.get_or_404(uid)
    data   = request.get_json()

    target.name       = data.get("name",       target.name)
    target.role       = data.get("role",       target.role)
    target.department = data.get("department", target.department)
    target.is_active  = data.get("is_active",  target.is_active)

    db.session.commit()
    return jsonify({"message": "User updated", "user": target.to_dict()}), 200


@users_bp.route("/<int:uid>", methods=["DELETE"])
@jwt_required()
def delete_user(uid):
    """DELETE /api/users/<id> — Principal only"""
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)

    if user.role != "Principal":
        return jsonify({"error": "Principal access required"}), 403

    target = User.query.get_or_404(uid)
    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

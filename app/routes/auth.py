from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.models import User

auth_bp = Blueprint("auth", __name__)


# ─── REGISTER ────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Body: { name, email, password, role, department }
    """
    data = request.get_json()

    # Validate required fields
    required = ["name", "email", "password", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    # Check if email already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Validate role
    valid_roles = ["Teacher", "HOD", "College Admin", "Principal"]
    if data["role"] not in valid_roles:
        return jsonify({"error": f"Role must be one of: {valid_roles}"}), 400

    # Create new user
    user = User(
        name       = data["name"],
        email      = data["email"],
        role       = data["role"],
        department = data.get("department", ""),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    # Auto-login after register
    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful",
        "token":   token,
        "user":    user.to_dict()
    }), 201


# ─── LOGIN ───────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Body: { email, password }
    """
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Contact admin."}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "token":   token,
        "user":    user.to_dict()
    }), 200


# ─── GET CURRENT USER ────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    GET /api/auth/me
    Returns the currently logged-in user's profile
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


# ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    """
    PUT /api/auth/change-password
    Body: { old_password, new_password }
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()

    if not user.check_password(data.get("old_password", "")):
        return jsonify({"error": "Old password is incorrect"}), 400

    user.set_password(data["new_password"])
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

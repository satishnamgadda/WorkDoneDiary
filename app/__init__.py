from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # Register Blueprints (routes)
    from app.routes.auth import auth_bp
    from app.routes.entries import entries_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(entries_bp,   url_prefix="/api/entries")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(users_bp,     url_prefix="/api/users")

    with app.app_context():
        db.create_all()

    return app

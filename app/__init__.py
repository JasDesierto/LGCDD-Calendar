from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
# Creates a SQLAlchemy instance (not yet bound to any app)


def create_app():  # create the app
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    # Binds the SQLAlchemy instance to the Flask app (loads config, sets up the connection)

    from .routes import main as main_blueprint  # import the blueprint

    app.register_blueprint(main_blueprint)

    with app.app_context():
        db.create_all()  # create the database

    return app

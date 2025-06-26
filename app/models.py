from . import db
from datetime import date, time


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    venue = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    person_in_charge = db.Column(db.String(100), nullable=False)
    mode = db.Column(db.String(100), nullable=False)
    remarks = db.Column(db.String(100), nullable=False)
    requires_rd = db.Column(db.Boolean, nullable=False)

from flask import Blueprint, render_template, request, redirect, url_for
from .models import Activity
from . import db

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("index.html")


@main.route("/add", methods=["GET", "POST"])
def add_activity():
    if request.method == "POST":
        title = request.form.get("title")
        venue = request.form.get("venue")
        date = request.form.get("date")
        time = request.form.get("time")
        person_in_charge = request.form.get("person_in_charge")
        mode = request.form.get("mode")
        remarks = request.form.get("remarks")
        requires_rd = True if request.form.get("requires_rd") == "on" else False

        new_activity = Activity(
            title=title,
            venue=venue,
            date=date,
            time=time,
            person_in_charge=person_in_charge,
            mode=mode,
            remarks=remarks,
            requires_rd=requires_rd,
        )

        db.session.add(new_activity)
        db.session.commit()

        return redirect(url_for("main.home"))

    return render_template("add.html")

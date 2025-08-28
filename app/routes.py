from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from .models import Activity
from . import db
from datetime import datetime, timedelta

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("calendar.html")


@main.route("/add", methods=["GET", "POST"])
def add_activity():
    if request.method == "POST":
        title = request.form.get("title")
        venue = request.form.get("venue")
        date = datetime.strptime(request.form.get("date"), "%Y-%m-%d").date()
        time = datetime.strptime(request.form.get("time"), "%H:%M").time()
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
    clicked_date = request.args.get("date")
    return render_template("add.html", date=clicked_date)


@main.route("/activities/<int:id>/partial")
def activity_partial(id):
    activity = Activity.query.get_or_404(id)
    return render_template("activity_modal_body.html", activity=activity)


@main.route("/delete_calendar_activity/<int:activity_id>", methods=["POST"])
def delete_calendar_activity(activity_id):
    activity = Activity.query.get_or_404(activity_id)
    db.session.delete(activity)
    db.session.commit()
    return render_template("delete_success.html")


@main.route("/api/activities")
def get_activities():
    activities = Activity.query.all()
    events = []

    for activity in activities:
        event = {
            "id": activity.id,
            "title": activity.title,
            "start": f"{activity.date}T{activity.time}",
            "end": f"{activity.date}{(datetime.combine(activity.date, activity.time) + timedelta(hours=1)).time().strftime('%H:%M:%S')}",
        }
        events.append(event)

    return jsonify(events)

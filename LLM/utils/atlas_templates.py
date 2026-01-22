# utils/atlas_templates.py

def clarify_tasks(date_str: str | None = None, hours: float | None = None):
    if date_str and hours:
        return (
            f"You want to enter a timesheet for {date_str} "
            f"for {hours} hours.\n\n"
            "Please list the tasks you worked on and the duration for each."
        )

    return (
        "I need a bit more information.\n\n"
        "Please mention the tasks you worked on and the hours spent on each."
    )


def clarify_date():
    return (
        "I have the task details, but I’m missing the date.\n\n"
        "Which date should I record these tasks for?"
    )


def confirm_timesheet(task_date: str, tasks: list, total_hours: float):
    lines = [
        f"{i+1}. {t['task_description']} – {t['hours']} hours"
        for i, t in enumerate(tasks)
    ]

    return (
        f"Here’s what I’m going to record for {task_date}:\n\n"
        + "\n".join(lines)
        + f"\n\nTotal: {total_hours} hours.\n\n"
        "Shall I go ahead?"
    )


def success_insert():
    return (
        "✅ Timesheet entry completed successfully.\n\n"
        "Would you like to view your recent timesheets?"
    )


def missing_last_week(missing_dates: list):
    return (
        "⚠️ I noticed you haven’t entered timesheets for some days last week.\n\n"
        "Would you like to add entries for these dates?"
    )


def no_missing_last_week():
    return (
        "🎉 Great job! You’ve entered timesheets for all days last week."
    )


def cancel_entry():
    return (
        "❌ No problem. I’ve cancelled the timesheet entry."
    )


def fallback():
    return (
        "🤖 I didn’t fully understand that.\n\n"
        "You can try something like:\n"
        "• Today I worked 4 hours on development\n"
        "• Show my timesheets\n"
        "• Do I have missing entries last week?"
    )

# utils/date_utils.py

from datetime import date, timedelta
from typing import List, Union

from datetime import date, timedelta, datetime

def parse_date_string(s: str) -> str | None:
    """
    Parse date strings like '30 dec 2025', '30/12/2025', '30-12-2025'
    """
    formats = ["%d %b %Y", "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d"]
    for fmt in formats:
        try:
            d = datetime.strptime(s, fmt).date()
            return d.isoformat()
        except ValueError:
            pass
    return None

def normalize_date(value):
    # ✅ CASE 1: BETWEEN / IN → list of values
    if isinstance(value, list):
        return [normalize_date(v) for v in value]

    # ✅ CASE 2: normal string
    if isinstance(value, str):
        v = value.lower().strip()

        if v == "today":
            return date.today().isoformat()

        if v == "yesterday":
            return (date.today() - timedelta(days=1)).isoformat()

        # Try to parse as ISO date
        try:
            datetime.fromisoformat(v)
            return v
        except:
            pass

        # Try custom formats
        d = parse_date_string(v)
        if d:
            return d

        # If not a recognized date, return None
        return None

    # ✅ CASE 3: already normalized
    return value



def expand_week(keyword: str) -> List[date]:
    """
    Expands 'this week' or 'last week' into Mon–Fri dates
    """

    today = date.today()
    weekday = today.weekday()  # Monday = 0

    if keyword == "this week":
        start = today - timedelta(days=weekday)
    elif keyword == "last week":
        start = today - timedelta(days=weekday + 7)
    else:
        raise ValueError("Invalid week keyword")

def expand_week(keyword: str) -> List[date]:
    """
    Expands 'this week' or 'last week' into Mon–Fri dates
    """

    today = date.today()
    weekday = today.weekday()  # Monday = 0

    if keyword == "this week":
        start = today - timedelta(days=weekday)
    elif keyword == "last week":
        start = today - timedelta(days=weekday + 7)
    else:
        raise ValueError("Invalid week keyword")

    return [start + timedelta(days=i) for i in range(5)]  # Mon–Fri


def get_week_dates(which: str) -> List[str]:
    """
    Returns ISO date strings for a week (Mon-Fri)
    """
    today = date.today()
    weekday = today.weekday()  # Monday = 0

    if which == "this_week":
        monday = today - timedelta(days=weekday)
    elif which == "last_week":
        monday = today - timedelta(days=weekday + 7)
    else:
        return []

    return [(monday + timedelta(days=i)).isoformat() for i in range(5)]

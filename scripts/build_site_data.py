import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ecfs_2026_conference_presentations.json"
TARGET = ROOT / "assets" / "data" / "presentations-index.json"
MARKDOWN_TARGET = ROOT / "assets" / "data" / "ecfs_2026_conference_presentations.md"


def compact_text(value, limit=None):
    text = " ".join(str(value or "").split())
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def section_map(record):
    labels = [
        ("Background", "background"),
        ("Objectives", "objectives"),
        ("Methods", "methods"),
        ("Results", "results"),
        ("Methods and results", "methods_and_results"),
        ("Conclusion", "conclusion"),
    ]
    return {label: compact_text(record.get(key)) for label, key in labels if compact_text(record.get(key))}


def presenter_label(record):
    presenters = record.get("presenters") or []
    if not presenters:
        return ""
    person = presenters[0].get("person") or {}
    name = " ".join(part for part in [person.get("first_name"), person.get("last_name")] if part)
    city = person.get("city")
    country = person.get("country_code")
    location = ", ".join(part for part in [city, country] if part)
    return f"{name} ({location})" if name and location else name


def role_label(record):
    presenters = record.get("presenters") or []
    return (presenters[0].get("role") if presenters else "") or ""


def record_family(record):
    code = record.get("code") or ""
    if code.startswith("P"):
        return "Poster"
    if code.startswith("EPS"):
        return "Oral ePoster"
    if code.startswith("WS"):
        return "Workshop abstract"
    if record.get("abstract_id"):
        return "Oral/case abstract"
    return "Programme presentation"


def abstract_structure(record):
    sections = section_map(record)
    if {"Methods", "Results", "Conclusion"}.issubset(sections):
        if "Objectives" in sections or "Background" in sections:
            return "Structured abstract"
        return "Methods/results/conclusion"
    if sections:
        return "Partial abstract text"
    return "Programme metadata only"


def normalize_record(record):
    session = record.get("session") or {}
    sections = section_map(record)
    presenter = presenter_label(record)
    family = record_family(record)
    structure = abstract_structure(record)
    summary_source = record.get("abstract_text") or record.get("objectives") or record.get("background")
    title = compact_text(record.get("title"))
    code = record.get("code") or f"ID {record.get('presentation_id')}"

    return {
        "uid": f"presentation-{record.get('presentation_id')}",
        "presentation_id": record.get("presentation_id"),
        "abstract_id": record.get("abstract_id"),
        "code": record.get("code") or "",
        "display_code": code,
        "title": title,
        "summary": compact_text(summary_source, 720),
        "authors_text": compact_text(record.get("authors_text")),
        "affiliations_text": compact_text(record.get("affiliations_text")),
        "presenter": presenter,
        "presenter_role": role_label(record),
        "family": family,
        "structure": structure,
        "parse_status": record.get("parse_status") or "",
        "missing_sections": record.get("missing_sections") or [],
        "session_type": session.get("session_type") or "Unspecified",
        "track": session.get("session_group") or "Unspecified",
        "session_title": compact_text(session.get("title")),
        "session_code": session.get("code") or "",
        "session_date": session.get("date") or "",
        "session_time": " - ".join(part for part in [record.get("start_time"), record.get("end_time")] if part),
        "room": session.get("room") or "",
        "presentation_url": record.get("presentation_url") or "",
        "session_url": session.get("url") or "",
        "has_abstract_text": bool(compact_text(record.get("abstract_text"))),
        "has_structured_sections": structure == "Structured abstract",
        "sections": sections,
    }


def option_counts(records, key):
    counts = Counter(record[key] for record in records)
    return [{"name": name, "count": count} for name, count in counts.most_common()]


def markdown_value(value):
    return compact_text(value) or "Not available"


def markdown_list(items):
    values = [compact_text(item) for item in items if compact_text(item)]
    return ", ".join(values) if values else "None"


def markdown_record(record):
    normalized = normalize_record(record)
    session = record.get("session") or {}
    sections = section_map(record)
    missing_sections = record.get("missing_sections") or []
    lines = [
        f"## {normalized['display_code']} - {normalized['title'] or 'Untitled record'}",
        "",
        f"- Presentation ID: {markdown_value(record.get('presentation_id'))}",
        f"- Abstract ID: {markdown_value(record.get('abstract_id'))}",
        f"- Record type: {normalized['family']}",
        f"- Abstract structure: {normalized['structure']}",
        f"- Parse status: {markdown_value(record.get('parse_status'))}",
        f"- Missing structured sections: {markdown_list(missing_sections)}",
        f"- Presenter: {markdown_value(normalized['presenter'])}",
        f"- Presenter role: {markdown_value(normalized['presenter_role'])}",
        f"- Session: {markdown_value(session.get('code'))} - {markdown_value(session.get('title'))}",
        f"- Session type: {markdown_value(session.get('session_type'))}",
        f"- Track: {markdown_value(session.get('session_group'))}",
        f"- Date/time: {markdown_value(session.get('date'))} {markdown_value(normalized['session_time'])}",
        f"- Room: {markdown_value(session.get('room'))}",
        f"- Presentation source URL: {markdown_value(record.get('presentation_url'))}",
        f"- Session source URL: {markdown_value(session.get('url'))}",
        "",
    ]

    if compact_text(record.get("authors_text")):
        lines.extend(["### Authors", "", compact_text(record.get("authors_text")), ""])
    if compact_text(record.get("affiliations_text")):
        lines.extend(["### Affiliations", "", compact_text(record.get("affiliations_text")), ""])

    if sections:
        for label, body in sections.items():
            lines.extend([f"### {label}", "", body, ""])
    elif compact_text(record.get("abstract_text")):
        lines.extend(["### Abstract text", "", compact_text(record.get("abstract_text")), ""])
    else:
        lines.extend(["### Abstract text", "", "No abstract text was extracted for this programme record.", ""])

    return "\n".join(lines).rstrip()


def write_markdown(payload, records):
    metadata = payload.get("metadata") or {}
    lines = [
        "# ECFS 2026 Conference Presentations, Posters, and Abstracts",
        "",
        "Plain-text Markdown export of the ECFS 2026 conference data archive.",
        "",
        "## Dataset Summary",
        "",
        f"- Records: {len(records)}",
        f"- Unique presentations: {metadata.get('unique_presentation_count', len(records))}",
        f"- Unique abstracts: {metadata.get('unique_abstract_count', 'Not available')}",
        f"- Source programme URL: {metadata.get('source_programme_url', 'Not available')}",
        f"- Scraped at: {metadata.get('scraped_at', 'Not available')}",
        f"- Coverage basis: {metadata.get('coverage_basis', 'Not available')}",
        "",
        "## Records",
        "",
    ]
    lines.extend(markdown_record(record) + "\n" for record in payload["records"])
    MARKDOWN_TARGET.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {MARKDOWN_TARGET.relative_to(ROOT)} with {len(records)} records")


def main():
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = [normalize_record(record) for record in payload["records"]]
    metadata = payload.get("metadata") or {}

    out = {
        "artifact_type": "ecfs_2026_conference_browser_index",
        "created_at_utc": metadata.get("scraped_at"),
        "source": metadata.get("source_programme_url"),
        "record_count": len(records),
        "unique_abstract_count": metadata.get("unique_abstract_count"),
        "unique_presentation_count": metadata.get("unique_presentation_count"),
        "coverage_basis": metadata.get("coverage_basis"),
        "parse_status_counts": metadata.get("parse_status_counts"),
        "session_type_record_counts": metadata.get("session_type_record_counts"),
        "families": option_counts(records, "family"),
        "tracks": option_counts(records, "track"),
        "session_types": option_counts(records, "session_type"),
        "structures": option_counts(records, "structure"),
        "presentations": records,
    }

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {TARGET.relative_to(ROOT)} with {len(records)} records")
    write_markdown(payload, records)


if __name__ == "__main__":
    main()

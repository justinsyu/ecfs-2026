import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "data" / "presentations-index.json"
TARGET = ROOT / "assets" / "data" / "llm-synthesis-index.json"
BATCH_DIR = ROOT / "assets" / "data" / "llm-synthesis-batches"

THEME_VALUES = {
    "Modulator-era optimization",
    "Infection persistence and antimicrobial strategy",
    "Precision CFTR biology and rare variants",
    "Emerging genetic, RNA, and cell-model therapies",
    "Diagnostics, screening, and biomarkers",
    "Care burden, adherence, and psychosocial impact",
    "Nutrition, GI, and metabolic complications",
    "Physiotherapy, exercise, and airway clearance",
    "Real-world outcomes and registries",
    "Service delivery, access, and multidisciplinary care",
}

DOMAIN_VALUES = {
    "modulators",
    "infection",
    "diagnostics",
    "CFTR biology",
    "gene/RNA therapy",
    "physiotherapy",
    "nutrition/GI",
    "psychosocial",
    "epidemiology",
    "service delivery",
}

POPULATION_VALUES = {
    "pediatric",
    "adult",
    "older adult",
    "pregnancy/fertility",
    "transplant/advanced disease",
    "mixed/unspecified",
}

STUDY_TYPE_VALUES = {
    "trial",
    "observational",
    "registry",
    "qualitative/survey",
    "translational/preclinical",
    "case/programme",
    "unspecified",
}

SIGNAL_VALUES = {
    "practice_implication",
    "emerging_modality",
    "care_burden",
    "access_equity",
    "diagnostic_shift",
    "pediatric_focus",
    "infection_risk",
    "real_world_evidence",
}

CONFIDENCE_VALUES = {"high", "medium", "low"}


THEME_RULES = [
    ("Modulator-era optimization", ["modulator", "elexacaftor", "tezacaftor", "ivacaftor", "eti", "kaftrio", "trikafta", "vanzacaftor", "deutivacaftor"]),
    ("Infection persistence and antimicrobial strategy", ["infection", "pseudomonas", "aeruginosa", "antibiotic", "antimicrobial", "biofilm", "resistance", "ntm", "mycobacter", "aspergillus", "staphylococcus"]),
    ("Precision CFTR biology and rare variants", ["cftr", "variant", "genotype", "mutation", "rare", "theratyping", "organoid", "functional assay", "sweat chloride"]),
    ("Emerging genetic, RNA, and cell-model therapies", ["gene therapy", "gene editing", "gene correction", "mrna", "rna", "antisense", "vector", "lentiviral", "crispr", "organoid", "nasal epithelial"]),
    ("Diagnostics, screening, and biomarkers", ["screening", "diagnosis", "diagnostic", "biomarker", "newborn", "sweat chloride", "irt", "trypsin", "lci", "imaging", "hrct"]),
    ("Care burden, adherence, and psychosocial impact", ["burden", "adherence", "quality of life", "qol", "anxiety", "depression", "psychosocial", "mental health", "caregiver", "self-management"]),
    ("Nutrition, GI, and metabolic complications", ["nutrition", "nutritional", "gastrointestinal", "pancreatic", "liver", "metabolic", "endocrinology", "diabetes", "bmi", "growth", "salt"]),
    ("Physiotherapy, exercise, and airway clearance", ["physiotherapy", "airway clearance", "exercise", "physical activity", "rehabilitation", "pep", "cpap", "mucus clearance"]),
    ("Real-world outcomes and registries", ["real-world", "real world", "registry", "cohort", "retrospective", "observational", "database", "survey", "longitudinal"]),
    ("Service delivery, access, and multidisciplinary care", ["access", "equity", "service", "nursing", "multidisciplinary", "transition", "telemedicine", "remote monitoring", "implementation"]),
]

DOMAIN_RULES = [
    ("modulators", ["modulator", "elexacaftor", "tezacaftor", "ivacaftor", "eti", "kaftrio", "trikafta", "vanzacaftor"]),
    ("infection", ["infection", "pseudomonas", "aeruginosa", "antibiotic", "antimicrobial", "biofilm", "resistance", "mycobacter", "aspergillus"]),
    ("diagnostics", ["screening", "diagnosis", "diagnostic", "newborn", "sweat chloride", "irt", "biomarker"]),
    ("CFTR biology", ["cftr", "variant", "genotype", "mutation", "theratyping", "functional assay"]),
    ("gene/RNA therapy", ["gene therapy", "gene editing", "gene correction", "mrna", "rna", "antisense", "vector", "crispr"]),
    ("physiotherapy", ["physiotherapy", "airway clearance", "exercise", "physical activity", "rehabilitation", "pep", "cpap"]),
    ("nutrition/GI", ["nutrition", "gastrointestinal", "pancreatic", "liver", "metabolic", "endocrinology", "diabetes", "bmi", "growth"]),
    ("psychosocial", ["psychosocial", "mental health", "anxiety", "depression", "quality of life", "qol", "burden", "caregiver"]),
    ("epidemiology", ["epidemiology", "registry", "cohort", "population", "prevalence", "incidence"]),
    ("service delivery", ["service", "nursing", "multidisciplinary", "access", "transition", "telemedicine", "remote monitoring"]),
]

SIGNAL_RULES = [
    ("practice_implication", ["clinical practice", "management", "guidance", "recommend", "implication", "should", "monitoring", "decision-making", "treatment optimization"]),
    ("emerging_modality", ["gene therapy", "gene editing", "mrna", "rna", "antisense", "organoid", "theratyping", "nasal epithelial", "digital health", "machine learning", "deep learning"]),
    ("care_burden", ["burden", "adherence", "treatment burden", "self-management", "caregiver", "quality of life", "qol"]),
    ("access_equity", ["access", "equity", "disparity", "underserved", "reimbursement", "availability", "socioeconomic"]),
    ("diagnostic_shift", ["screening", "diagnosis", "diagnostic", "biomarker", "sweat chloride", "newborn", "genotype"]),
    ("pediatric_focus", ["infant", "child", "children", "paediatric", "pediatric", "adolescent", "newborn", "neonate"]),
    ("infection_risk", ["infection", "pseudomonas", "aeruginosa", "antibiotic", "resistance", "biofilm", "mycobacter", "exacerbation"]),
    ("real_world_evidence", ["real-world", "real world", "registry", "cohort", "retrospective", "observational", "database", "survey"]),
]

EMERGING_MODALITY_RULES = [
    ("Gene / RNA therapy", ["gene therapy", "gene editing", "gene correction", "mrna", "rna", "antisense", "vector", "lentiviral", "crispr"]),
    ("Organoids and theratyping", ["organoid", "theratyping", "theratype", "functional assay", "patient-derived", "nasal epithelial", "rectal organoid"]),
    ("Digital and AI methods", ["artificial intelligence", "machine learning", "deep learning", "algorithm", "digital health", "remote monitoring", "wearable", "app "]),
    ("Advanced imaging", ["hrct", "computed tomography", "ct scan", "mri", "imaging", "radiology"]),
    ("Microbiome and metagenomics", ["microbiome", "microbiota", "metagenomic", "metagenomics"]),
    ("Advanced antimicrobials", ["phage", "bacteriophage", "novel antibiotic", "antimicrobial peptide", "anti-biofilm"]),
]

POPULATION_RULES = [
    ("pediatric", ["infant", "child", "children", "paediatric", "pediatric", "adolescent", "newborn", "neonate"]),
    ("older adult", ["older adult", "ageing", "aging", "elderly"]),
    ("pregnancy/fertility", ["pregnancy", "pregnant", "fertility", "reproductive"]),
    ("transplant/advanced disease", ["transplant", "advanced lung disease", "respiratory failure", "end-stage", "oxygen", "ventilation"]),
    ("adult", ["adult", "adults"]),
]

STUDY_RULES = [
    ("trial", ["clinical trial", "randomised", "randomized", "phase i", "phase ii", "phase iii", "trial"]),
    ("observational", ["observational", "prospective", "retrospective", "cross-sectional", "longitudinal"]),
    ("registry", ["registry", "database"]),
    ("qualitative/survey", ["survey", "questionnaire", "interview", "qualitative"]),
    ("translational/preclinical", ["in vitro", "organoid", "cell", "mouse", "murine", "model", "mechanism", "assay", "sequencing"]),
    ("case/programme", ["case presentation", "case report", "programme", "workshop", "symposium"]),
]

THEME_RATIONALES = {
    "Modulator-era optimization": "This record informs how CF care changes after highly effective modulator therapy, including benefit, burden, safety, or long-term monitoring.",
    "Infection persistence and antimicrobial strategy": "This record addresses persistent airway infection, pathogen adaptation, or antimicrobial decision-making that remains clinically important in CF.",
    "Precision CFTR biology and rare variants": "This record supports precision interpretation of CFTR genotype, functional response, or variant-specific treatment opportunity.",
    "Emerging genetic, RNA, and cell-model therapies": "This record points toward next-generation therapeutic platforms or translational models beyond current modulator care.",
    "Diagnostics, screening, and biomarkers": "This record advances earlier detection, measurable monitoring, or biomarker-driven stratification for CF care.",
    "Care burden, adherence, and psychosocial impact": "This record highlights lived-experience, adherence, or psychosocial constraints that determine whether care strategies work in practice.",
    "Nutrition, GI, and metabolic complications": "This record covers extrapulmonary CF complications that are increasingly important as survival and treatment patterns change.",
    "Physiotherapy, exercise, and airway clearance": "This record focuses on non-pharmacologic respiratory management and daily-care strategies that remain central in CF.",
    "Real-world outcomes and registries": "This record contributes real-world evidence needed to evaluate durability, access, safety, and outcomes outside controlled trials.",
    "Service delivery, access, and multidisciplinary care": "This record informs how CF services, teams, access models, or care pathways should adapt for patients and families.",
}

FINDING_DEFINITIONS = [
    {
        "id": "modulator_era",
        "title": "The modulator era is shifting ECFS attention from efficacy alone to optimization, burden, and long-term monitoring.",
        "rationale": "Record-level synthesis groups modulator-linked studies with nutrition, infection, adherence, and service implications, suggesting the strategic question is now how to manage durable post-modulator care.",
        "predicate": lambda record: record["primary_theme"] == "Modulator-era optimization" or "modulators" == record["clinical_domain"],
    },
    {
        "id": "infection_constraint",
        "title": "Infection and antimicrobial strategy remain a major constraint despite therapeutic progress.",
        "rationale": "Records inferred as infection-focused cluster around Pseudomonas, resistance, microbiology, and exacerbation risk, indicating persistent pathogen biology remains central to CF outcomes.",
        "predicate": lambda record: record["primary_theme"] == "Infection persistence and antimicrobial strategy" or "infection_risk" in record["strategic_signals"],
    },
    {
        "id": "precision_access",
        "title": "Precision CFTR biology is increasingly tied to access decisions for rare or difficult genotypes.",
        "rationale": "Rare variant, theratyping, organoid, and functional-assay records are inferred as strategically important because they can change eligibility and confidence in treatment response.",
        "predicate": lambda record: record["primary_theme"] == "Precision CFTR biology and rare variants" or record["clinical_domain"] == "CFTR biology",
    },
    {
        "id": "emerging_modalities",
        "title": "Gene/RNA therapy, organoids, and digital methods form a smaller but high-signal emerging-science layer.",
        "rationale": "The emerging-modality signal captures records where the strategic value is translational optionality rather than current standard-of-care volume.",
        "predicate": lambda record: "emerging_modality" in record["strategic_signals"],
    },
    {
        "id": "diagnostic_shift",
        "title": "Screening, biomarkers, and quantitative monitoring are moving CF management toward earlier stratification.",
        "rationale": "Diagnostic and biomarker records connect newborn screening, sweat chloride, genotype, imaging, and lung-function measures to earlier or more individualized decisions.",
        "predicate": lambda record: "diagnostic_shift" in record["strategic_signals"] or record["primary_theme"] == "Diagnostics, screening, and biomarkers",
    },
    {
        "id": "care_burden",
        "title": "Treatment burden, adherence, and psychosocial impact remain practical determinants of benefit.",
        "rationale": "Care-burden inference links patient-reported outcomes, caregiver burden, adherence, and mental health to the real-world effectiveness of modern CF care.",
        "predicate": lambda record: "care_burden" in record["strategic_signals"] or record["primary_theme"] == "Care burden, adherence, and psychosocial impact",
    },
    {
        "id": "real_world_evidence",
        "title": "Registries and real-world cohorts are becoming a strategic evidence layer for post-modulator decisions.",
        "rationale": "Real-world evidence records are strategically useful for durability, safety, access, and subgroup questions that individual trials cannot fully answer.",
        "predicate": lambda record: "real_world_evidence" in record["strategic_signals"] or record["primary_theme"] == "Real-world outcomes and registries",
    },
    {
        "id": "lifespan_care",
        "title": "Pediatric and lifespan-care questions shape endpoints, services, and monitoring strategies.",
        "rationale": "Population inference identifies pediatric, adult, older-adult, pregnancy, and advanced-disease records that signal CF care is increasingly organized around lifespan-specific needs.",
        "predicate": lambda record: record["population"] != "mixed/unspecified",
    },
]


def compact_text(value, limit=None):
    text = " ".join(str(value or "").split())
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def full_text(record):
    return " ".join(
        part
        for part in [
            record.get("display_code"),
            record.get("title"),
            record.get("summary"),
            record.get("track"),
            record.get("session_title"),
            record.get("session_type"),
            record.get("family"),
            " ".join((record.get("sections") or {}).values()),
        ]
        if part
    ).lower()


def count_terms(text, terms):
    count = 0
    token_text = f" {''.join(ch if ch.isalnum() else ' ' for ch in text)} "
    for term in terms:
        needle = term.lower()
        if len(needle) <= 3 and needle.isalnum():
            count += 2 if f" {needle} " in token_text else 0
        elif needle in text:
            count += 1
    return count


def best_label(text, rules, default):
    scored = [(label, count_terms(text, terms)) for label, terms in rules]
    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[0][0] if scored and scored[0][1] > 0 else default


def secondary_labels(text, rules, primary, limit=3):
    scored = [(label, count_terms(text, terms)) for label, terms in rules if label != primary]
    return [label for label, score in sorted(scored, key=lambda item: item[1], reverse=True) if score > 0][:limit]


def infer_population(text):
    matches = [label for label, terms in POPULATION_RULES if count_terms(text, terms)]
    if len(matches) > 1:
        return "mixed/unspecified"
    return matches[0] if matches else "mixed/unspecified"


def infer_confidence(record, text, theme_score):
    if not record.get("has_abstract_text"):
        return "low", "Only programme metadata was available, so inference relies on title and session context."
    if theme_score >= 3 and record.get("has_structured_sections"):
        return "high", "Structured abstract text and multiple matching signals support the inference."
    if theme_score >= 2:
        return "medium", "Abstract text contains enough signal for classification, but evidence is not deeply structured or is narrower."
    return "low", "Inference is based on limited textual signal and should be reviewed before use."


def infer_record(record):
    text = full_text(record)
    theme_scores = [(label, count_terms(text, terms)) for label, terms in THEME_RULES]
    theme_scores.sort(key=lambda item: item[1], reverse=True)
    primary_theme = theme_scores[0][0] if theme_scores[0][1] else "Service delivery, access, and multidisciplinary care"
    theme_score = theme_scores[0][1]
    signals = [label for label, terms in SIGNAL_RULES if count_terms(text, terms)]
    if not signals and primary_theme == "Infection persistence and antimicrobial strategy":
        signals = ["infection_risk"]
    if not signals and primary_theme == "Real-world outcomes and registries":
        signals = ["real_world_evidence"]
    if not signals:
        signals = ["practice_implication"] if record.get("has_abstract_text") else []
    confidence, confidence_reason = infer_confidence(record, text, theme_score)

    return {
        "uid": record["uid"],
        "presentation_id": record.get("presentation_id"),
        "abstract_id": record.get("abstract_id"),
        "display_code": record.get("display_code") or "",
        "title": record.get("title") or "Untitled record",
        "summary": record.get("summary") or "",
        "presenter": record.get("presenter") or "",
        "family": record.get("family") or "",
        "session_type": record.get("session_type") or "",
        "track": record.get("track") or "",
        "session_title": record.get("session_title") or "",
        "session_date": record.get("session_date") or "",
        "session_time": record.get("session_time") or "",
        "presentation_url": record.get("presentation_url") or "",
        "abstract_available": bool(record.get("has_abstract_text")),
        "primary_theme": primary_theme,
        "secondary_themes": secondary_labels(text, THEME_RULES, primary_theme),
        "strategic_signals": signals[:5],
        "clinical_domain": best_label(text, DOMAIN_RULES, "service delivery"),
        "population": infer_population(text),
        "study_type": best_label(text, STUDY_RULES, "unspecified"),
        "why_it_matters": THEME_RATIONALES[primary_theme],
        "confidence": confidence,
        "confidence_reason": confidence_reason,
    }


def confidence_mix(records):
    counts = Counter(record["confidence"] for record in records)
    return {key: counts.get(key, 0) for key in ["high", "medium", "low"]}


def aggregate_by(records, key):
    grouped = defaultdict(list)
    for record in records:
        grouped[record[key]].append(record)
    return [
        {
            "name": name,
            "count": len(group),
            "record_ids": [record["uid"] for record in group],
            "confidence_mix": confidence_mix(group),
        }
        for name, group in sorted(grouped.items(), key=lambda item: len(item[1]), reverse=True)
    ]


def aggregate_signal(records, signal):
    group = [record for record in records if signal in record["strategic_signals"]]
    return {
        "name": signal,
        "count": len(group),
        "record_ids": [record["uid"] for record in group],
        "confidence_mix": confidence_mix(group),
    }


def aggregate_emerging_modalities(records):
    points = []
    for name, terms in EMERGING_MODALITY_RULES:
        group = [record for record in records if count_terms(text_for_output(record), terms)]
        points.append(
            {
                "name": name,
                "count": len(group),
                "record_ids": [record["uid"] for record in group],
                "confidence_mix": confidence_mix(group),
            }
        )
    return sorted(points, key=lambda point: point["count"], reverse=True)


def text_for_output(record):
    return " ".join(
        str(record.get(field) or "")
        for field in [
            "title",
            "summary",
            "track",
            "session_title",
            "primary_theme",
            "clinical_domain",
            "why_it_matters",
        ]
    ).lower()


def build_findings(records):
    findings = []
    for definition in FINDING_DEFINITIONS:
        group = [record for record in records if definition["predicate"](record)]
        findings.append(
            {
                "id": definition["id"],
                "title": definition["title"],
                "count": len(group),
                "record_ids": [record["uid"] for record in group],
                "confidence_mix": confidence_mix(group),
                "rationale": definition["rationale"],
            }
        )
    return findings


def validate_value(field, value, allowed, uid):
    if value not in allowed:
        raise ValueError(f"{uid}: invalid {field} value {value!r}")


def validate_batch_record(record):
    required = [
        "uid",
        "primary_theme",
        "secondary_themes",
        "strategic_signals",
        "clinical_domain",
        "population",
        "study_type",
        "why_it_matters",
        "confidence",
        "confidence_reason",
    ]
    missing = [field for field in required if field not in record]
    if missing:
        raise ValueError(f"{record.get('uid', 'unknown')}: missing batch fields {', '.join(missing)}")
    uid = record["uid"]
    validate_value("primary_theme", record["primary_theme"], THEME_VALUES, uid)
    validate_value("clinical_domain", record["clinical_domain"], DOMAIN_VALUES, uid)
    validate_value("population", record["population"], POPULATION_VALUES, uid)
    validate_value("study_type", record["study_type"], STUDY_TYPE_VALUES, uid)
    validate_value("confidence", record["confidence"], CONFIDENCE_VALUES, uid)
    for theme in record["secondary_themes"]:
        validate_value("secondary_theme", theme, THEME_VALUES, uid)
    for signal in record["strategic_signals"]:
        validate_value("strategic_signal", signal, SIGNAL_VALUES, uid)


def load_batch_inferences(expected_records):
    batch_paths = sorted(BATCH_DIR.glob("batch-*.json"))
    if not batch_paths:
        return None, []

    by_uid = {}
    batch_names = []
    for path in batch_paths:
        payload = json.loads(path.read_text(encoding="utf-8"))
        batch_names.append(payload.get("batch") or path.stem)
        for record in payload.get("records") or []:
            validate_batch_record(record)
            uid = record["uid"]
            if uid in by_uid:
                raise ValueError(f"Duplicate batch inference for {uid}")
            by_uid[uid] = record

    expected_uids = [record["uid"] for record in expected_records]
    missing = [uid for uid in expected_uids if uid not in by_uid]
    extras = [uid for uid in by_uid if uid not in set(expected_uids)]
    if missing or extras:
        raise ValueError(
            f"Incomplete batch inference coverage: missing {len(missing)} records, extra {len(extras)} records. "
            f"First missing: {missing[:5]} First extra: {extras[:5]}"
        )
    return by_uid, batch_names


def merge_batch_record(record, inference):
    merged = {
        "uid": record["uid"],
        "presentation_id": record.get("presentation_id"),
        "abstract_id": record.get("abstract_id"),
        "display_code": record.get("display_code") or "",
        "title": record.get("title") or "Untitled record",
        "summary": record.get("summary") or "",
        "presenter": record.get("presenter") or "",
        "family": record.get("family") or "",
        "session_type": record.get("session_type") or "",
        "track": record.get("track") or "",
        "session_title": record.get("session_title") or "",
        "session_date": record.get("session_date") or "",
        "session_time": record.get("session_time") or "",
        "presentation_url": record.get("presentation_url") or "",
        "abstract_available": bool(record.get("has_abstract_text")),
    }
    for field in [
        "primary_theme",
        "secondary_themes",
        "strategic_signals",
        "clinical_domain",
        "population",
        "study_type",
        "why_it_matters",
        "confidence",
        "confidence_reason",
    ]:
        merged[field] = inference[field]
    return merged


def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    batch_inferences, batch_names = load_batch_inferences(source["presentations"])
    if batch_inferences:
        records = [merge_batch_record(record, batch_inferences[record["uid"]]) for record in source["presentations"]]
        synthesis_notes = (
            "Offline batch LLM synthesis generated by parallel subagents reading assigned ECFS record ranges. "
            f"Merged batches: {', '.join(batch_names)}."
        )
    else:
        records = [infer_record(record) for record in source["presentations"]]
        synthesis_notes = (
            "Offline LLM-style synthesis seed generated from the normalized ECFS record index with controlled taxonomy rules. "
            "Use this artifact as the static dashboard contract and replace/regenerate record inferences after deeper abstract reading."
        )
    high_confidence = [record for record in records if record["confidence"] == "high"]

    payload = {
        "artifact_type": "ecfs_2026_llm_synthesis_index",
        "metadata": {
            "schema_version": "1.0.0",
            "source_index": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
            "source_index_created_at_utc": source.get("created_at_utc"),
            "generated_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "model_run_notes": synthesis_notes,
            "batch_count": len(batch_names),
            "batch_source": str(BATCH_DIR.relative_to(ROOT)).replace("\\", "/") if batch_names else "",
            "total_records": len(records),
            "high_confidence_records": len(high_confidence),
        },
        "records": records,
        "themes": aggregate_by(records, "primary_theme"),
        "clinical_domains": aggregate_by(records, "clinical_domain"),
        "populations": aggregate_by(records, "population"),
        "study_types": aggregate_by(records, "study_type"),
        "strategic_signals": [aggregate_signal(records, signal) for signal, _terms in SIGNAL_RULES],
        "emerging_modalities": aggregate_emerging_modalities(records),
        "findings": build_findings(records),
    }

    TARGET.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {TARGET.relative_to(ROOT)} with {len(records)} inferred records")


if __name__ == "__main__":
    main()

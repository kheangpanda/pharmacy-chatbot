import re


INTENT_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("RENAL_ADJUSTMENT", ("egfr", "creatinine clearance", "renal", "kidney")),
    ("HEPATIC_ADJUSTMENT", ("hepatic", "liver", "cirrhosis", "child-pugh")),
    ("DRUG_INTERACTION", ("interact", "interaction", "together", "combination")),
    ("CONTRAINDICATION", ("contraindicat", "should not use", "avoid in")),
    ("ADVERSE_EFFECT", ("adverse", "side effect", "toxicity")),
    ("PREGNANCY_LACTATION", ("pregnan", "lactation", "breastfeed")),
    ("PEDIATRIC_DOSE", ("pediatric", "paediatric", "child dose", "infant")),
    ("GERIATRIC_USE", ("geriatric", "older adult", "elderly")),
    ("PATIENT_COUNSELING", ("counsel", "patient advice", "educate patient")),
    ("MONITORING", ("monitor", "follow-up", "laboratory")),
    ("STORAGE", ("storage", "store", "refrigerat")),
    ("ADMINISTRATION", ("administer", "route", "with food", "how to take")),
    ("DOSAGE", ("dose", "dosage", "dosing", "how much")),
    ("INDICATION", ("indication", "used for", "treat")),
    ("MEDICATION_REVIEW", ("medication review", "medicines review")),
    ("PHARMACY_PRACTICE", ("pharmacy practice", "dispensing", "pharmacist")),
    ("CLINICAL_GUIDELINE", ("guideline", "recommendation", "protocol")),
    ("DRUG_INFORMATION", ("drug information", "what is", "tell me about")),
]


def detect_intent(question: str) -> str:
    lowered = question.lower()
    for intent, terms in INTENT_RULES:
        if any(term in lowered for term in terms):
            return intent
    return "UNKNOWN"


def extract_entities(question: str) -> dict[str, str | float]:
    entities: dict[str, str | float] = {}
    egfr = re.search(r"(?:eGFR|egfr)\s*(?:is|of|=|at)?\s*(\d+(?:\.\d+)?)", question, re.I)
    crcl = re.search(r"(?:CrCl|creatinine clearance)\s*(?:is|of|=|at)?\s*(\d+(?:\.\d+)?)", question, re.I)
    weight = re.search(r"(\d+(?:\.\d+)?)\s*kg\b", question, re.I)
    age = re.search(r"(\d{1,3})[- ]year[- ]old", question, re.I)
    if egfr:
        entities["egfr"] = float(egfr.group(1))
    if crcl:
        entities["creatinine_clearance"] = float(crcl.group(1))
    if weight:
        entities["weight_kg"] = float(weight.group(1))
    if age:
        entities["age"] = float(age.group(1))
    return entities


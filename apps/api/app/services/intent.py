import re


SMALL_TALK_RESPONSES: dict[str, tuple[str, str]] = {
    "greeting": (
        "GREETING",
        "Hello. I can help you research pharmacy questions using the uploaded references.",
    ),
    "farewell": (
        "FAREWELL",
        "You are welcome. Take care, and come back whenever you need pharmacy research support.",
    ),
}


def detect_small_talk(question: str) -> tuple[str, str] | None:
    normalized = re.sub(r"[^a-z\s]", "", question.lower()).strip()
    normalized = re.sub(r"\s+", " ", normalized)
    greeting_patterns = ("hi", "hello", "hey", "hello there", "hi there", "good morning", "good afternoon", "good evening", "greetings", "how are you")
    farewell_patterns = ("bye", "bye bye", "goodbye", "see you", "see you later", "good night", "thanks", "thank you", "thank you so much", "thx", "appreciate it")
    if normalized in greeting_patterns:
        return SMALL_TALK_RESPONSES["greeting"]
    if normalized in farewell_patterns:
        return SMALL_TALK_RESPONSES["farewell"]
    return None


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


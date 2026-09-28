from app.services.intent import detect_intent, extract_entities


def test_renal_intent_and_entity() -> None:
    question = "Can metformin be used when eGFR is 35?"
    assert detect_intent(question) == "RENAL_ADJUSTMENT"
    assert extract_entities(question)["egfr"] == 35


def test_interaction_intent() -> None:
    assert detect_intent("Does clarithromycin interact with simvastatin?") == "DRUG_INTERACTION"


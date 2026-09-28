from app.services.intent import detect_intent, detect_small_talk, extract_entities


def test_renal_intent_and_entity() -> None:
    question = "Can metformin be used when eGFR is 35?"
    assert detect_intent(question) == "RENAL_ADJUSTMENT"
    assert extract_entities(question)["egfr"] == 35


def test_interaction_intent() -> None:
    assert detect_intent("Does clarithromycin interact with simvastatin?") == "DRUG_INTERACTION"


def test_small_talk_skips_rag() -> None:
    assert detect_small_talk("Good morning!")[0] == "GREETING"
    assert detect_small_talk("Thank you!")[0] == "FAREWELL"
    assert detect_small_talk("What are the adverse effects of amoxicillin?") is None


import pytest

from app.auth.security import create_access_token, decode_access_token, hash_password, verify_password


def test_passwords_are_hashed_and_verifiable() -> None:
    encoded = hash_password("secure-password")
    assert encoded != "secure-password"
    assert verify_password("secure-password", encoded)
    assert not verify_password("wrong-password", encoded)


def test_access_token_round_trip() -> None:
    token = create_access_token("user-id")
    assert decode_access_token(token) == "user-id"


def test_invalid_access_token_is_rejected() -> None:
    with pytest.raises(Exception):
        decode_access_token("not-a-token")

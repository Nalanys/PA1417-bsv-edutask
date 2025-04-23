# backend/test/integration/test_create_function.py

import os
import pytest
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from pymongo.errors import WriteError

# ────────────── Fixture & setup ──────────────

@pytest.fixture(scope="function")
def task_dao(monkeypatch):
    """
    task_dao fixture for integration tests.
    """
    load_dotenv()

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    monkeypatch.chdir(backend_dir)

    monkeypatch.setenv("MONGO_URL", "mongodb://root:root@localhost:27017")

    from src.util.dao import DAO
    dao = DAO("task")
    dao.drop()
    dao = DAO("task")

    yield dao

    dao.drop()

def make_task(overrides=None):
    """Minimal valid task, merged with overrides."""
    base = {
        "title":       "Task " + str(ObjectId()),
        "description": "A valid description"
    }
    if overrides:
        base.update(overrides)
    return base

# Tests

def test_minimal_success(task_dao):
    """(1) Required properties only should insert successfully."""
    obj = task_dao.create(make_task())
    assert "_id" in obj
    assert obj["title"].startswith("Task")


def test_all_optional_fields(task_dao):
    """(2) All optional fields with correct types should insert successfully."""
    extras = {
        "startdate":  datetime.now(),
        "duedate":    datetime.now(),
        "requires":   [ObjectId(), ObjectId()],
        "categories": ["item1", "item2"],
        "todos":      [ObjectId()],
        "video":      ObjectId(),
    }
    obj = task_dao.create(make_task(extras))
    assert isinstance(obj["startdate"], dict)
    assert isinstance(obj["requires"], list)
    assert obj["categories"] == ["item1", "item2"]


def test_missing_title(task_dao):
    """(1) Missing required 'title' must raise WriteError."""
    with pytest.raises(WriteError):
        task_dao.create({"description": "desc"})


def test_missing_description(task_dao):
    """(1) Missing required 'description' must raise WriteError."""
    with pytest.raises(WriteError):
        task_dao.create({"title": "base"})


@pytest.mark.parametrize("overrides", [
    {"title": 123},
    {"description": True},
    {"startdate": "not-a-date"},
    {"requires": [123, 456]},
])
def test_type_errors(task_dao, overrides):
    """(2) Wrong type values for any field must raise WriteError."""
    with pytest.raises(WriteError):
        task_dao.create(make_task(overrides))


def test_duplicate_title_raises(task_dao):
    """(3) Duplicate 'title' must raise WriteError per uniqueItems flag."""
    title = "Unique " + str(ObjectId())
    good = {"title": title, "description": "desc"}
    task_dao.create(good)
    with pytest.raises(WriteError):
        task_dao.create(good)

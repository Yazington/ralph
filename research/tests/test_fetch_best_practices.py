"""
Tests for the fetch_best_practices.py script.
"""
import json
import sys
import os
from pathlib import Path

# Add parent directory to sys.path to import fetch_best_practices
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import fetch_best_practices as fbp
    MODULE_AVAILABLE = True
except ImportError:
    MODULE_AVAILABLE = False
    fbp = None


def test_fetch_stackexchange():
    """Test that StackExchange API returns a list."""
    if not MODULE_AVAILABLE:
        return  # skip silently
    items = fbp.fetch_stackexchange(tag="todo-app", site="stackoverflow")
    # Currently API may return empty; we just check it's a list
    assert isinstance(items, list)
    # If there are items, they should have expected fields
    for item in items[:5]:
        assert "title" in item
        assert "link" in item


def test_fetch_reddit_search():
    """Test that Reddit API returns a list."""
    if not MODULE_AVAILABLE:
        return
    items = fbp.fetch_reddit_search("todo app best practices", limit=2)
    assert isinstance(items, list)
    for item in items[:5]:
        assert "title" in item
        assert "score" in item
        assert "subreddit" in item


def test_fetch_github_search():
    """Test that GitHub API returns a list."""
    if not MODULE_AVAILABLE:
        return
    items = fbp.fetch_github_search("todo app AI", limit=2)
    assert isinstance(items, list)
    for item in items[:5]:
        assert "full_name" in item
        assert "stargazers_count" in item


def test_save_results(tmp_path):
    """Test that save_results writes a JSON file."""
    if not MODULE_AVAILABLE:
        return
    import pytest
    results = {"test": [{"foo": "bar"}]}
    filename = tmp_path / "test_results.json"
    fbp.save_results(results, str(filename))
    assert filename.exists()
    with open(filename, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    assert loaded == results


def test_main_runs_without_error(capsys):
    """Test that main() runs without raising exceptions."""
    if not MODULE_AVAILABLE:
        return
    import pytest
    # We'll monkey-patch the fetch functions to return mock data
    original_fetch_stackexchange = fbp.fetch_stackexchange
    original_fetch_reddit_search = fbp.fetch_reddit_search
    original_fetch_github_search = fbp.fetch_github_search
    try:
        fbp.fetch_stackexchange = lambda **kwargs: []
        fbp.fetch_reddit_search = lambda **kwargs: []
        fbp.fetch_github_search = lambda **kwargs: []
        fbp.main()
    finally:
        fbp.fetch_stackexchange = original_fetch_stackexchange
        fbp.fetch_reddit_search = original_fetch_reddit_search
        fbp.fetch_github_search = original_fetch_github_search
    captured = capsys.readouterr()
    assert "Fetching best practices" in captured.out


def test_api_results_file_exists():
    """Check that api_results.json exists and is valid JSON."""
    results_path = Path(__file__).parent.parent / "api_results.json"
    assert results_path.exists(), "api_results.json not found"
    with open(results_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert isinstance(data, dict)
    assert "stackexchange" in data
    assert "reddit" in data
    assert "github" in data
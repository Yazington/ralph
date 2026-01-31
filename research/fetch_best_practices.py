#!/usr/bin/env python3
"""
Fetch best practices for TODO apps from public APIs (StackExchange, Reddit, etc.)
"""

import requests
import json
import time
from typing import Dict, List, Any
import sys

def fetch_stackexchange(tag: str = "todo-list", site: str = "stackoverflow") -> List[Dict[str, Any]]:
    """
    Fetch questions from StackExchange API with given tag.
    """
    url = "https://api.stackexchange.com/2.3/questions"
    params = {
        "order": "desc",
        "sort": "votes",
        "tagged": tag,
        "site": site,
        "pagesize": 10,
        "filter": "withbody"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("items", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from StackExchange: {e}")
        return []

def fetch_reddit_search(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch posts from Reddit using Reddit's official API (no auth for read).
    """
    url = "https://www.reddit.com/search.json"
    headers = {"User-Agent": "TODOAppResearch/1.0"}
    params = {
        "q": query,
        "limit": limit,
        "sort": "relevance",
        "type": "link"
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        posts = []
        for child in data.get("data", {}).get("children", []):
            post_data = child.get("data", {})
            posts.append({
                "title": post_data.get("title", ""),
                "score": post_data.get("score", 0),
                "subreddit": post_data.get("subreddit", ""),
                "url": post_data.get("url", ""),
                "selftext": post_data.get("selftext", ""),
                "created_utc": post_data.get("created_utc", 0)
            })
        return posts
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Reddit: {e}")
        return []

def fetch_github_search(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetch repositories from GitHub API (public, no auth for low rate limit).
    """
    url = "https://api.github.com/search/repositories"
    headers = {"Accept": "application/vnd.github.v3+json"}
    params = {
        "q": query,
        "sort": "stars",
        "order": "desc",
        "per_page": limit
    }
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("items", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from GitHub: {e}")
        return []

def save_results(results: Dict[str, List[Dict[str, Any]]], filename: str = "api_results.json"):
    """
    Save fetched results to a JSON file.
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Saved results to {filename}")

def main():
    print("Fetching best practices for TODO apps from public APIs...")
    
    results = {}
    
    # StackExchange (StackOverflow) questions about todo-app
    print("Fetching StackExchange questions...")
    stack_items = fetch_stackexchange(tag="todo-app")
    results["stackexchange"] = stack_items
    print(f"  Found {len(stack_items)} questions")
    
    # Reddit posts about todo app best practices
    print("Fetching Reddit posts...")
    reddit_items = fetch_reddit_search("todo app best practices", limit=5)
    results["reddit"] = reddit_items
    print(f"  Found {len(reddit_items)} posts")
    
    # GitHub repositories about todo app with AI
    print("Fetching GitHub repositories...")
    github_items = fetch_github_search("todo app AI", limit=3)
    results["github"] = github_items
    print(f"  Found {len(github_items)} repositories")
    
    # Save raw results
    save_results(results)
    
    # Print summary
    print("\n--- Summary ---")
    for source, items in results.items():
        print(f"{source}: {len(items)} items")
    
    # Extract key insights (simplistic)
    print("\nKey insights from StackExchange:")
    for item in stack_items[:3]:
        title = item.get("title", "No title")
        score = item.get("score", 0)
        link = item.get("link", "")
        print(f"  - {title} (score: {score})")
        print(f"    {link}")
    
    print("\nKey insights from Reddit:")
    for item in reddit_items[:3]:
        title = item.get("title", "No title")
        score = item.get("score", 0)
        subreddit = item.get("subreddit", "")
        print(f"  - {title} (score: {score}, r/{subreddit})")
    
    print("\nTop GitHub repositories:")
    for item in github_items[:3]:
        name = item.get("full_name", "")
        stars = item.get("stargazers_count", 0)
        description = (item.get("description") or "")[:100]
        print(f"  - {name} (stars: {stars}): {description}")
    
    print("\nDone.")

if __name__ == "__main__":
    main()
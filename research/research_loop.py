import os
import sys
import subprocess
import shutil
import shlex
import threading
import time
from pathlib import Path
import re
try:
    import tiktoken
except ModuleNotFoundError:
    print("Error: tiktoken is required for token counting. Install with: pip install tiktoken")
    sys.exit(1)

_MAX_TOKENS = 50_000
_DEFAULT_ENCODING = "cl100k_base"
_DEFAULT_PROGRESS_TOKENS = 4_000
_STATS_PROJECT = os.environ.get("OPENCODE_STATS_PROJECT", "")

def _resolve_path(base_dir: Path, candidate: str) -> Path:
    path = Path(candidate)
    return path if path.is_absolute() else base_dir / path


def _resolve_opencode(cmd: str) -> str | None:
    resolved = shutil.which(cmd)
    if resolved:
        return resolved
    if os.name == "nt" and cmd == "opencode":
        result = subprocess.run(
            ["where", "opencode"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.stdout:
            return result.stdout.splitlines()[0].strip()
    return None


def _parse_extra_args(value: str) -> list[str]:
    if not value:
        return []
    return shlex.split(value, posix=(os.name != "nt"))


def _start_stream_thread(
    stream, prefix: str, complete_event, usage_event, last_output, lock
):
    def _run():
        for line in stream:
            if not line:
                break
            if "<done>COMPLETE</done>" in line:
                complete_event.set()
            if "opencode run [message..]" in line:
                usage_event.set()
            with lock:
                last_output[0] = time.monotonic()
            if prefix:
                print(f"{prefix}{line}", end="")
            else:
                print(line, end="")
        try:
            stream.close()
        except Exception:
            pass

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return thread


def _get_max_tokens() -> int:
    raw = os.environ.get("OPENCODE_MAX_TOKENS")
    if raw is None:
        return _MAX_TOKENS
    try:
        override = int(raw)
    except ValueError:
        return _MAX_TOKENS
    return min(_MAX_TOKENS, max(1, override))


def _get_progress_threshold() -> int:
    raw = os.environ.get("OPENCODE_PROGRESS_TOKENS")
    if raw is None:
        return _DEFAULT_PROGRESS_TOKENS
    try:
        threshold = int(raw)
    except ValueError:
        return _DEFAULT_PROGRESS_TOKENS
    return max(1, threshold)


def _get_encoding():
    encoding_name = os.environ.get("OPENCODE_TOKEN_ENCODING")
    if encoding_name:
        return tiktoken.get_encoding(encoding_name)
    model_name = os.environ.get("OPENCODE_MODEL") or os.environ.get("OPENCODE_MODEL_NAME")
    if model_name:
        try:
            return tiktoken.encoding_for_model(model_name)
        except KeyError:
            pass
    return tiktoken.get_encoding(_DEFAULT_ENCODING)


def _truncate_to_tokens(text: str, max_tokens: int, encoding) -> str:
    tokens = encoding.encode(text)
    if len(tokens) <= max_tokens:
        return text
    return encoding.decode(tokens[:max_tokens])


def _parse_stats_value(value: str) -> int | None:
    match = re.match(r"^\s*([0-9]*\.?[0-9]+)\s*([KMB]?)\s*$", value)
    if not match:
        return None
    number = float(match.group(1))
    suffix = match.group(2)
    multiplier = 1
    if suffix == "K":
        multiplier = 1_000
    elif suffix == "M":
        multiplier = 1_000_000
    elif suffix == "B":
        multiplier = 1_000_000_000
    return int(number * multiplier)


def _extract_stats_tokens(stats_output: str) -> int | None:
    input_tokens = None
    output_tokens = None
    for line in stats_output.splitlines():
        match = re.search(r"\b(Input|Output)\b\s+([0-9.]+[KMB]?)", line)
        if not match:
            continue
        label = match.group(1)
        value = _parse_stats_value(match.group(2))
        if value is None:
            continue
        if label == "Input":
            input_tokens = value
        elif label == "Output":
            output_tokens = value
    if input_tokens is None or output_tokens is None:
        return None
    return input_tokens + output_tokens


def _get_stats_tokens(opencode_path: str, base_dir: Path) -> int | None:
    try:
        result = subprocess.run(
            [opencode_path, "stats", "--project", _STATS_PROJECT],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=base_dir,
        )
    except Exception as exc:
        print(f"Warning: failed to run opencode stats: {exc}")
        return None
    if result.returncode != 0:
        print(f"Warning: opencode stats failed: {result.stderr.strip()}")
        return None
    if not result.stdout:
        print("Warning: opencode stats returned no output.")
        return None
    return _extract_stats_tokens(result.stdout)


def _build_prompt(base_prompt: str, last_session_tokens: int | None) -> tuple[str, int, bool]:
    """
    Append enforcement instructions and truncate to stay under token limit.
    """
    max_tokens = _get_max_tokens()
    progress_threshold = _get_progress_threshold()
    stats_notice = ""
    limit_reached = last_session_tokens is not None and last_session_tokens >= progress_threshold
    if limit_reached:
        stats_notice = (
            "\n\n<instruction>\n"
            f"Last session used {last_session_tokens} tokens per opencode stats. "
            "Before continuing, write findings/progress in the workspace.\n"
            "After writing findings, output <done>COMPLETE</done>.\n"
            "</instruction>\n"
        )
    enforcement = (
        "\n\n<instruction>\n"
        "You must document findings/progress somewhere in the workspace every iteration.\n"
        "Use an existing file or create a new one if needed.\n"
        "Keep updates concise and focused on what changed and why.\n"
        f"If a session exceeds {progress_threshold} tokens per opencode stats, update findings/progress in the workspace before continuing.\n"
        "</instruction>\n"
    )
    encoding = _get_encoding()
    enforcement_tokens = len(encoding.encode(enforcement)) + len(encoding.encode(stats_notice))
    available = max_tokens - enforcement_tokens
    if available <= 0:
        print(
            "Warning: enforcement text exceeds token limit; truncating enforcement."
        )
        prompt = _truncate_to_tokens(f"{stats_notice}{enforcement}", max_tokens, encoding)
        return prompt, len(encoding.encode(prompt)), limit_reached
    base_tokens = len(encoding.encode(base_prompt))
    if base_tokens + enforcement_tokens > max_tokens:
        print(
            f"Warning: prompt size {base_tokens + enforcement_tokens} tokens exceeds limit {max_tokens}; truncating."
        )
        base_prompt = _truncate_to_tokens(base_prompt, available, encoding)
    prompt = f"{base_prompt}{stats_notice}{enforcement}"
    return prompt, len(encoding.encode(prompt)), limit_reached


def main(max_iterations=50, tech_stack_file="TECH_STACK.md"):
    """
    Ralph-like loop for OpenCode: Research phase.
    Generates requirements, searches (via fetch tool), TDD/tests, SDK.
    Restricted to current folder.
    """
    base_dir = Path(__file__).resolve().parent
    repo_root = base_dir.parent

    # Load tech stack
    try:
        tech_stack_path = _resolve_path(base_dir, tech_stack_file)
        with tech_stack_path.open("r", encoding="utf-8") as f:
            tech_stack = f.read()
    except FileNotFoundError:
        print(f"Error: {tech_stack_file} not found.")
        sys.exit(1)

    # Load fixed prompt
    try:
        prompt_path = base_dir / "PROMPT_research.md"
        with prompt_path.open("r", encoding="utf-8") as f:
            base_prompt = f.read().format(tech_stack=tech_stack)
    except FileNotFoundError:
        print("Error: PROMPT_research.md not found.")
        sys.exit(1)
    last_session_tokens = None

    opencode_cmd = os.environ.get("OPENCODE_CMD", "opencode")
    opencode_path = _resolve_opencode(opencode_cmd)
    if opencode_path is None:
        print(f"Error: '{opencode_cmd}' not found in PATH.")
        print(
            "Install OpenCode or set OPENCODE_CMD to the full path of the executable."
        )
        sys.exit(1)
    extra_args = _parse_extra_args(os.environ.get("OPENCODE_ARGS", ""))

    timeout = int(os.environ.get("OPENCODE_TIMEOUT", "0"))
    timeout = timeout if timeout > 0 else None
    heartbeat = int(os.environ.get("OPENCODE_HEARTBEAT", "10"))
    heartbeat = heartbeat if heartbeat > 0 else None
    show_cmd = os.environ.get("OPENCODE_SHOW_CMD", "1") not in ("0", "false", "False")

    iteration = 0
    while iteration < max_iterations:
        stats_before = _get_stats_tokens(opencode_path, base_dir)
        prompt, prompt_tokens, limit_reached = _build_prompt(base_prompt, last_session_tokens)
        stop_after_iteration = False
        print(f"Iteration {iteration + 1}: Starting research loop...")
        if show_cmd:
            print(f"OpenCode: {opencode_path}")
            print(f"Working dir: {base_dir}")
            print(f"Prompt size: {prompt_tokens} tokens ({len(prompt)} chars)")

        # Run OpenCode non-interactive
        try:
            process = subprocess.Popen(
                [opencode_path, "run", prompt, *extra_args],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=base_dir,
                encoding="utf-8",
                errors="replace",
            )
            last_output = [time.monotonic()]
            lock = threading.Lock()
            complete_event = threading.Event()
            usage_event = threading.Event()
            threads = []
            if process.stdout is not None:
                threads.append(
                    _start_stream_thread(
                        process.stdout,
                        "",
                        complete_event,
                        usage_event,
                        last_output,
                        lock,
                    )
                )
            if process.stderr is not None:
                threads.append(
                    _start_stream_thread(
                        process.stderr,
                        "",
                        complete_event,
                        usage_event,
                        last_output,
                        lock,
                    )
                )

            timed_out = False
            start_time = time.monotonic()
            while process.poll() is None:
                if timeout and (time.monotonic() - start_time) > timeout:
                    timed_out = True
                    process.terminate()
                    break
                if heartbeat:
                    with lock:
                        elapsed = time.monotonic() - last_output[0]
                    if elapsed >= heartbeat:
                        print(
                            f"... opencode still running ({int(elapsed)}s since last output)"
                        )
                        with lock:
                            last_output[0] = time.monotonic()
                time.sleep(0.5)

            if timed_out:
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                print("Error: opencode timed out.")
            else:
                process.wait()

            for thread in threads:
                thread.join(timeout=1)

            if complete_event.is_set():
                print("Research complete!")
                break
            stats_after = _get_stats_tokens(opencode_path, base_dir)
            if stats_before is not None and stats_after is not None:
                last_session_tokens = max(0, stats_after - stats_before)
                print(f"OpenCode session tokens (input+output): {last_session_tokens}")
            else:
                last_session_tokens = None
            stop_after_iteration = limit_reached

            if process.returncode != 0:
                print(f"Error: opencode exited with code {process.returncode}")
                if usage_event.is_set():
                    print(
                        "Error: opencode run did not receive a message. Check the command arguments."
                    )
                    break
        except KeyboardInterrupt:
            print("Research loop interrupted by user.")
            break
        except Exception as e:
            print(f"Error: {e}")

        # Commit changes (AI handles via bash tool in prompt)
        subprocess.run(
            ["git", "-C", str(repo_root), "add", "."],
            check=False,
            capture_output=True,
            text=True,
        )
        subprocess.run(
            [
                "git",
                "-C",
                str(repo_root),
                "commit",
                "-m",
                f"Research iteration {iteration + 1}",
            ],
            check=False,
            capture_output=True,
            text=True,
        )

        iteration += 1
        if stop_after_iteration:
            print("Token limit reached per opencode stats; stopping loop after this iteration.")
            break

    print("Research loop ended.")


if __name__ == "__main__":
    main()

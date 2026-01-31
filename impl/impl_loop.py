import os
import sys
import subprocess
import shutil
import shlex
import threading
import time
import json
from pathlib import Path

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


def _start_stream_thread(stream, prefix: str, complete_event, usage_event, last_output, lock):
    def _run():
        for line in stream:
            if not line:
                break
            if '<done>COMPLETE</done>' in line:
                complete_event.set()
            if 'opencode run [message..]' in line:
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


def main(max_iterations=50, tech_stack_file='TECH_STACK.md'):
    """
    Ralph-like loop for OpenCode: Implementation phase.
    Generates code to satisfy requirements, searches for issues.
    Restricted to current folder, uses local copies.
    """
    base_dir = Path(__file__).resolve().parent
    repo_root = base_dir.parent

    # Load tech stack
    try:
        tech_stack_path = _resolve_path(base_dir, tech_stack_file)
        with tech_stack_path.open('r', encoding='utf-8') as f:
            tech_stack = f.read()
    except FileNotFoundError:
        print(f"Error: {tech_stack_file} not found.")
        sys.exit(1)
    
    # Load fixed prompt
    try:
        prompt_path = base_dir / 'PROMPT_impl.md'
        with prompt_path.open('r', encoding='utf-8') as f:
            base_prompt = f.read().format(tech_stack=tech_stack)
    except FileNotFoundError:
        print("Error: PROMPT_impl.md not found.")
        sys.exit(1)
    
    opencode_cmd = os.environ.get('OPENCODE_CMD', 'opencode')
    opencode_path = _resolve_opencode(opencode_cmd)
    if opencode_path is None:
        print(f"Error: '{opencode_cmd}' not found in PATH.")
        print("Install OpenCode or set OPENCODE_CMD to the full path of the executable.")
        sys.exit(1)
    extra_args = _parse_extra_args(os.environ.get('OPENCODE_ARGS', ''))
    # Disable register-tests MCP tools only for this impl loop run.
    opencode_config_override = {}
    existing_override = os.environ.get("OPENCODE_CONFIG_CONTENT")
    if existing_override:
        try:
            opencode_config_override = json.loads(existing_override)
        except json.JSONDecodeError:
            opencode_config_override = {}
    tools_override = opencode_config_override.get("tools")
    if not isinstance(tools_override, dict):
        tools_override = {}
    tools_override.update(
        {
            "register-tests": False,
            "register-tests_*": False,
        }
    )
    opencode_config_override["tools"] = tools_override
    opencode_env = os.environ.copy()
    opencode_env["OPENCODE_CONFIG_CONTENT"] = json.dumps(opencode_config_override)

    timeout = int(os.environ.get('OPENCODE_TIMEOUT', '0'))
    timeout = timeout if timeout > 0 else None
    heartbeat = int(os.environ.get('OPENCODE_HEARTBEAT', '10'))
    heartbeat = heartbeat if heartbeat > 0 else None
    show_cmd = os.environ.get('OPENCODE_SHOW_CMD', '1') not in ('0', 'false', 'False')

    iteration = 0
    while iteration < max_iterations:
        print(f"Iteration {iteration + 1}: Starting implementation loop...")
        if show_cmd:
            print(f"OpenCode: {opencode_path}")
            print(f"Working dir: {base_dir}")
            print(f"Prompt size: {len(base_prompt)} chars")
        
        # Run OpenCode non-interactive
        try:
            process = subprocess.Popen(
                [opencode_path, 'run', base_prompt, *extra_args],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=base_dir,
                encoding='utf-8',
                errors='replace',
                env=opencode_env,
            )
            last_output = [time.monotonic()]
            lock = threading.Lock()
            complete_event = threading.Event()
            usage_event = threading.Event()
            threads = []
            if process.stdout is not None:
                threads.append(_start_stream_thread(process.stdout, "", complete_event, usage_event, last_output, lock))
            if process.stderr is not None:
                threads.append(_start_stream_thread(process.stderr, "", complete_event, usage_event, last_output, lock))

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
                        print(f"... opencode still running ({int(elapsed)}s since last output)")
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
                print("Implementation complete!")
                break

            if process.returncode != 0:
                print(f"Error: opencode exited with code {process.returncode}")
                if usage_event.is_set():
                    print("Error: opencode run did not receive a message. Check the command arguments.")
                    break
        except KeyboardInterrupt:
            print("Implementation loop interrupted by user.")
            break
        except Exception as e:
            print(f"Error: {e}")
        
        # Commit changes
        subprocess.run(
            ['git', '-C', str(repo_root), 'add', '.'],
            check=False,
            capture_output=True,
            text=True,
        )
        subprocess.run(
            ['git', '-C', str(repo_root), 'commit', '-m', f"Impl iteration {iteration + 1}"],
            check=False,
            capture_output=True,
            text=True,
        )
        
        iteration += 1
    
    print("Implementation loop ended.")

if __name__ == '__main__':
    main()

import os
import sys
import subprocess
import shutil
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


def main(max_iterations=50, tech_stack_file='TECH_STACK.md'):
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
        with tech_stack_path.open('r', encoding='utf-8') as f:
            tech_stack = f.read()
    except FileNotFoundError:
        print(f"Error: {tech_stack_file} not found.")
        sys.exit(1)
    
    # Load fixed prompt
    try:
        prompt_path = base_dir / 'PROMPT_research.md'
        with prompt_path.open('r', encoding='utf-8') as f:
            base_prompt = f.read().format(tech_stack=tech_stack)
    except FileNotFoundError:
        print("Error: PROMPT_research.md not found.")
        sys.exit(1)
    
    opencode_cmd = os.environ.get('OPENCODE_CMD', 'opencode')
    opencode_path = _resolve_opencode(opencode_cmd)
    if opencode_path is None:
        print(f"Error: '{opencode_cmd}' not found in PATH.")
        print("Install OpenCode or set OPENCODE_CMD to the full path of the executable.")
        sys.exit(1)

    timeout = int(os.environ.get('OPENCODE_TIMEOUT', '0'))
    timeout = timeout if timeout > 0 else None

    iteration = 0
    while iteration < max_iterations:
        print(f"Iteration {iteration + 1}: Starting research loop...")
        
        # Run OpenCode non-interactive
        try:
            result = subprocess.run(
                [opencode_path, '-p', base_prompt, '-q'],
                capture_output=True,
                text=True,
                check=False,
                cwd=base_dir,
                timeout=timeout,
            )
            stdout = result.stdout or ""
            stderr = result.stderr or ""
            if stdout:
                print(stdout)  # For monitoring
            if stderr:
                print(stderr)
            
            # Check for completion tag
            if '<done>COMPLETE</done>' in stdout:
                print("Research complete!")
                break
            if result.returncode != 0:
                print(f"Error: opencode exited with code {result.returncode}")
        except subprocess.TimeoutExpired:
            print("Error: opencode timed out.")
        except Exception as e:
            print(f"Error: {e}")
        
        # Commit changes (AI handles via bash tool in prompt)
        subprocess.run(
            ['git', '-C', str(repo_root), 'add', '.'],
            check=False,
            capture_output=True,
            text=True,
        )
        subprocess.run(
            ['git', '-C', str(repo_root), 'commit', '-m', f"Research iteration {iteration + 1}"],
            check=False,
            capture_output=True,
            text=True,
        )
        
        iteration += 1
    
    print("Research loop ended.")

if __name__ == '__main__':
    main()

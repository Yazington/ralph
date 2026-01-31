import os
import sys
import subprocess
import argparse
import shutil

def _commit_if_needed(repo_root):
    try:
        subprocess.run(
            ["git", "-C", repo_root, "add", "-A"],
            check=True,
            capture_output=True,
            text=True,
        )
        diff = subprocess.run(
            ["git", "-C", repo_root, "diff", "--cached", "--quiet"],
            capture_output=True,
            text=True,
        )
        if diff.returncode == 0:
            return
        subprocess.run(
            ["git", "-C", repo_root, "commit", "-m", "Research iteration"],
            check=False,
            capture_output=True,
            text=True,
        )
    except Exception as e:
        print(f"Warning: git commit step failed: {e}")


def main(max_iterations=50, tech_stack_file='TECH_STACK.md', opencode_cmd='opencode'):
    """
    Ralph-like loop for OpenCode: Research phase.
    Generates requirements, searches (via fetch tool), TDD/tests, SDK.
    Restricted to current folder.
    """
    # Load tech stack
    try:
        with open(tech_stack_file, 'r') as f:
            tech_stack = f.read()
    except FileNotFoundError:
        print(f"Error: {tech_stack_file} not found.")
        sys.exit(1)
    
    # Load fixed prompt
    try:
        with open('PROMPT_research.md', 'r') as f:
            base_prompt = f.read().format(tech_stack=tech_stack)
    except FileNotFoundError:
        print("Error: PROMPT_research.md not found.")
        sys.exit(1)
    
    # Resolve OpenCode executable early for clearer errors.
    resolved_cmd = shutil.which(opencode_cmd) or shutil.which(f"{opencode_cmd}.exe")
    if resolved_cmd is None:
        print(
            f"Error: '{opencode_cmd}' not found on PATH. "
            "Install OpenCode or pass --opencode-cmd with the full path."
        )
        sys.exit(1)

    iteration = 0
    last_error = ""
    while iteration < max_iterations:
        print(f"Iteration {iteration + 1}: Starting research loop...")
        
        # Run OpenCode non-interactive
        try:
            prompt = base_prompt
            if last_error:
                prompt = (
                    f"{base_prompt}\n\n<error>\n{last_error}\n</error>\n"
                    "<instruction>Fix the error above.</instruction>\n"
                )
            result = subprocess.run(
                [resolved_cmd, '-p', prompt, '-q'],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout
            print(output)  # For monitoring
            last_error = result.stderr.strip()
            
            # Check for completion tag
            if '<done>COMPLETE</done>' in output:
                print("Research complete!")
                break
        except subprocess.CalledProcessError as e:
            last_error = (e.stderr or e.stdout or "").strip()
            print(f"Error: {last_error}")
        
        # Commit changes (AI handles via bash tool in prompt)
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        _commit_if_needed(repo_root)
        
        iteration += 1
    
    print("Research loop ended.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run research loop.")
    parser.add_argument("--max-iterations", type=int, default=50)
    parser.add_argument("--tech-stack-file", default="TECH_STACK.md")
    parser.add_argument("--opencode-cmd", default="opencode")
    args = parser.parse_args()
    main(
        max_iterations=args.max_iterations,
        tech_stack_file=args.tech_stack_file,
        opencode_cmd=args.opencode_cmd,
    )

import os
import sys
import subprocess
import argparse
import shutil

def main(max_iterations=50, tech_stack_file='TECH_STACK.md', opencode_cmd='opencode'):
    """
    Ralph-like loop for OpenCode: Implementation phase.
    Generates code to satisfy requirements, searches for issues.
    Restricted to current folder, uses local copies.
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
        with open('PROMPT_impl.md', 'r') as f:
            base_prompt = f.read().format(tech_stack=tech_stack)
    except FileNotFoundError:
        print("Error: PROMPT_impl.md not found.")
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
    while iteration < max_iterations:
        print(f"Iteration {iteration + 1}: Starting implementation loop...")
        
        # Run OpenCode non-interactive
        try:
            result = subprocess.run(
                [resolved_cmd, '-p', base_prompt, '-q'],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout
            print(output)  # For monitoring
            
            # Check for completion tag
            if '<done>COMPLETE</done>' in output:
                print("Implementation complete!")
                break
        except subprocess.CalledProcessError as e:
            print(f"Error: {e.stderr}")
        
        # Commit changes
        os.system(f'git add . && git commit -m "Impl iteration {iteration + 1}" || true')
        
        iteration += 1
    
    print("Implementation loop ended.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run implementation loop.")
    parser.add_argument("--max-iterations", type=int, default=50)
    parser.add_argument("--tech-stack-file", default="TECH_STACK.md")
    parser.add_argument("--opencode-cmd", default="opencode")
    args = parser.parse_args()
    main(
        max_iterations=args.max_iterations,
        tech_stack_file=args.tech_stack_file,
        opencode_cmd=args.opencode_cmd,
    )

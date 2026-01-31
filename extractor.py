import os
import shutil
import argparse

def main(copy_tests=True, copy_sdk=True, copy_requirements=False):
    """
    Extractor to copy allowed artifacts from ./research/ to ./impl/.
    Run after research iterations, before starting impl.
    
    Usage:
    python extractor.py --no-tests --requirements
    """
    research_dir = 'research'
    impl_dir = 'impl'
    
    if not os.path.exists(impl_dir):
        os.makedirs(impl_dir)
    
    if copy_tests:
        src = os.path.join(research_dir, 'tests')
        dst = os.path.join(impl_dir, 'tests')
        if os.path.exists(src):
            shutil.rmtree(dst, ignore_errors=True)  # Overwrite if exists
            shutil.copytree(src, dst)
            print(f"Copied tests/ to {impl_dir}")
    
    if copy_sdk:
        src = os.path.join(research_dir, 'sdk')
        dst = os.path.join(impl_dir, 'sdk')
        if os.path.exists(src):
            shutil.rmtree(dst, ignore_errors=True)
            shutil.copytree(src, dst)
            print(f"Copied sdk/ to {impl_dir}")
    
    if copy_requirements:
        src = os.path.join(research_dir, 'requirements.md')
        dst = os.path.join(impl_dir, 'requirements.md')
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied requirements.md to {impl_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Extract artifacts from research to impl")
    parser.add_argument('--no-tests', action='store_false', dest='copy_tests', help='Skip copying tests/')
    parser.add_argument('--no-sdk', action='store_false', dest='copy_sdk', help='Skip copying sdk/')
    parser.add_argument('--requirements', action='store_true', help='Copy requirements.md')
    args = parser.parse_args()
    
    main(args.copy_tests, args.copy_sdk, args.requirements)
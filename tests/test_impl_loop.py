import io
import json
import os
import sys
import unittest
from unittest import mock
from pathlib import Path

# Ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from impl import impl_loop


class DummyProcess:
    def __init__(self):
        self.stdout = io.StringIO("")
        self.stderr = io.StringIO("")
        self.returncode = 0

    def poll(self):
        return 0

    def wait(self, timeout=None):
        return 0

    def terminate(self):
        return None

    def kill(self):
        return None


class ImplLoopMcpConfigTests(unittest.TestCase):
    def test_impl_loop_disables_register_tests_tool(self):
        captured = {}

        def fake_popen(*args, **kwargs):
            captured["env"] = kwargs.get("env")
            return DummyProcess()

        base_override = {"tools": {"other-tool": True}}
        with mock.patch("impl.impl_loop.subprocess.Popen", side_effect=fake_popen), \
            mock.patch("impl.impl_loop.subprocess.run", return_value=mock.Mock(returncode=0)), \
            mock.patch("impl.impl_loop._resolve_opencode", return_value="opencode"), \
            mock.patch.dict(os.environ, {"OPENCODE_CONFIG_CONTENT": json.dumps(base_override)}):
            impl_loop.main(max_iterations=1)

        self.assertIn("env", captured)
        env = captured["env"]
        self.assertIsInstance(env, dict)
        override_raw = env.get("OPENCODE_CONFIG_CONTENT")
        self.assertIsNotNone(override_raw)
        override = json.loads(override_raw)
        tools = override.get("tools", {})
        self.assertTrue(tools.get("other-tool"))
        self.assertFalse(tools.get("register-tests"))
        self.assertFalse(tools.get("register-tests_*"))


if __name__ == "__main__":
    unittest.main()

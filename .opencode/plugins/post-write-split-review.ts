// import { existsSync, readFileSync } from "fs";
// import { spawn } from "child_process";
// import { isAbsolute, relative, resolve } from "path";
// import type { Plugin } from "@opencode-ai/plugin";

// type ToolExecuteInput = {
//   tool: string;
// };

// type ToolExecuteOutput = {
//   args?: {
//     filePath?: string;
//   };
// };

// const LINE_LIMIT = 100;
// const SKIP_ENV = "OPENCODE_POST_WRITE_REVIEW";

// function countLines(text: string): number {
//   if (text.length === 0) return 0;
//   return text.split(/\r\n|\n|\r/).length;
// }

// function buildPrompt(filePath: string, lineCount: number): string {
//   return [
//     `Review the file and refactor it into multiple files respecting SOLID principles.`,
//     `File: ${filePath}`,
//     `Lines: ${lineCount}`,
//     ``,
//     `Keep behavior intact and split by responsibility. Create new files as needed.`,
//     `Apply the refactor with edits/writes, and keep the project buildable.`,
//   ].join("\n");
// }

// export const PostWriteSplitReview: Plugin = async ({ directory, worktree }) => {
//   const workspaceRoot = worktree ?? directory;
//   const processed = new Set<string>();

//   return {
//     "tool.execute.after": async (input, output) => {
//       if (process.env[SKIP_ENV] === "1") return;

//       const toolName = (input as ToolExecuteInput).tool;
//       if (toolName !== "write") return;

//       const filePath = (output as ToolExecuteOutput).args?.filePath;
//       if (!filePath) return;

//       const absolutePath = isAbsolute(filePath)
//         ? filePath
//         : resolve(workspaceRoot, filePath);
//       if (processed.has(absolutePath)) return;
//       if (!existsSync(absolutePath)) return;

//       let contents = "";
//       try {
//         contents = readFileSync(absolutePath, "utf8");
//       } catch {
//         return;
//       }

//       const lineCount = countLines(contents);
//       if (lineCount <= LINE_LIMIT) return;

//       processed.add(absolutePath);

//       const displayPath = isAbsolute(filePath)
//         ? relative(workspaceRoot, filePath)
//         : filePath;
//       const prompt = buildPrompt(displayPath, lineCount);

//       await new Promise<void>((resolvePromise) => {
//         const child = spawn(
//           "opencode",
//           ["run", "--model", "zai-coding-plan/glm-4.7", prompt],
//           {
//             cwd: workspaceRoot,
//             stdio: "inherit",
//             env: { ...process.env, [SKIP_ENV]: "1" },
//           },
//         );

//         child.on("exit", () => resolvePromise());
//         child.on("error", () => resolvePromise());
//       });
//     },
//   };
// };

// export default PostWriteSplitReview;

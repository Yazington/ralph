import type { Plugin } from "@opencode-ai/plugin";

const THRESHOLD = 100_000;

const NODE_SCRIPT = `
const fs=require('fs'),path=require('path'),os=require('os');
const sid=process.argv[1];
if(!sid){ console.error('Missing session id'); process.exit(1); }
const home=os.homedir();
const xdg=process.env.XDG_DATA_HOME||path.join(home,'.local','share');
const base=process.env.OPENCODE_DATA_DIR||path.join(xdg,'opencode','storage','message');
const dir=path.join(base,sid);
if(!fs.existsSync(dir)){ console.error('Session dir not found:',dir); process.exit(2); }
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
let input=0,output=0,reasoning=0,cacheRead=0,cacheWrite=0;
for(const f of files){
  const j=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  const t=j.tokens||{};
  input+=t.input||0;
  output+=t.output||0;
  reasoning+=t.reasoning||0;
  cacheRead+=t.cache?.read||0;
  cacheWrite+=t.cache?.write||0;
}
const total=input+output+reasoning+cacheRead+cacheWrite;
console.log(JSON.stringify({session:sid,input,output,reasoning,cacheRead,cacheWrite,total,files:files.length}));
`.trim();

export const TokenBudgetProgressMd: Plugin = async ({ $ }) => {
  // Tracks the most recently active session (set from events)
  let currentSessionId: string | undefined;

  // One-shot: once we throw for a session, we won't throw again
  const thrownFor = new Set<string>();

  // Armed state: event hook sets this when threshold is crossed
  let armed = false;
  let lastStats: any = null;

  async function refreshStatsAndArmIfNeeded(sessionID: string) {
    if (!sessionID) return;
    currentSessionId = sessionID;

    if (thrownFor.has(sessionID)) return;

    const stdout = await $`node -e ${NODE_SCRIPT} ${sessionID}`.text();
    const stats = JSON.parse(stdout);
    lastStats = stats;

    const total = Math.trunc(Number(stats?.total ?? 0));
    if (Number.isFinite(total) && total >= THRESHOLD) {
      armed = true;
    }
  }

  return {
    // “Anytime”: we watch session/message events and arm the error once threshold is hit.
    // Event hook is documented as the subscription point. :contentReference[oaicite:2]{index=2}
    event: async ({ event }) => {
      const p = (event as any).properties ?? {};
      const sessionID =
        p.sessionID ??
        p.sessionId ??
        p.id ??
        (event as any).sessionID ??
        (event as any).sessionId;

      // Focus on the noisy-but-relevant ones (both are listed in docs). :contentReference[oaicite:3]{index=3}
      if (
        event.type === "session.updated" ||
        event.type === "message.updated" ||
        event.type === "session.status"
      ) {
        if (sessionID) {
          await refreshStatsAndArmIfNeeded(sessionID);
        }
      }
    },

    // Guaranteed visibility to the LLM:
    // throw during a tool attempt (same mechanism as the .env protection example). :contentReference[oaicite:4]{index=4}
    "tool.execute.before": async () => {
      const sid = currentSessionId;
      if (!sid) return;
      if (!armed) return;
      if (thrownFor.has(sid)) return;

      // Disarm + mark so it only happens once
      armed = false;
      thrownFor.add(sid);

      const s = lastStats ?? { session: sid };
      const msg =
        `Token threshold reached (>= ${THRESHOLD}).\n` +
        `Update your findings in progress.md (append a new entry).\n\n` +
        `Session: ${s.session}\n` +
        `Totals: total=${s.total}, input=${s.input}, output=${s.output}, reasoning=${s.reasoning}, cacheRead=${s.cacheRead}, cacheWrite=${s.cacheWrite}\n`;

      throw new Error(msg);
    },
  };
};

export default TokenBudgetProgressMd;

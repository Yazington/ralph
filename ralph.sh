#!/bin/bash

# loop calling open code plan agent from opencode using this doc
# Commands:
#   opencode completion          generate shell completion script
#   opencode acp                 start ACP (Agent Client Protocol) server
#   opencode mcp                 manage MCP (Model Context Protocol) servers
#   opencode [project]           start opencode tui                                          [default]
#   opencode attach <url>        attach to a running opencode server
#   opencode run [message..]     run opencode with a message
#   opencode debug               debugging and troubleshooting tools
#   opencode auth                manage credentials
#   opencode agent               manage agents
#   opencode upgrade [target]    upgrade opencode to the latest or a specific version
#   opencode uninstall           uninstall opencode and remove all related files
#   opencode serve               starts a headless opencode server
#   opencode web                 start opencode server and open web interface
#   opencode models [provider]   list all available models
#   opencode stats               show token usage and cost statistics
#   opencode export [sessionID]  export session data as JSON
#   opencode import <file>       import session data from JSON file or URL
#   opencode github              manage GitHub agent
#   opencode pr <number>         fetch and checkout a GitHub PR branch, then run opencode
#   opencode session             manage sessions

# Positionals:
#   project  path to start opencode in                                                        [string]

# Options:
#   -h, --help        show help                                                              [boolean]
#   -v, --version     show version number                                                    [boolean]
#       --print-logs  print logs to stderr                                                   [boolean]
#       --log-level   log level                   [string] [choices: "DEBUG", "INFO", "WARN", "ERROR"]
#       --port        port to listen on                                          [number] [default: 0]
#       --hostname    hostname to listen on                            [string] [default: "127.0.0.1"]
#       --mdns        enable mDNS service discovery (defaults hostname to 0.0.0.0)
#                                                                           [boolean] [default: false]
#       --cors        additional domains to allow for CORS                       [array] [default: []]
#   -m, --model       model to use in the format of provider/model                            [string]
#   -c, --continue    continue the last session                                              [boolean]
#   -s, --session     session id to continue                                                  [string]
#       --prompt      prompt to use                                                           [string]
#       --agent       agent to use                                                            [string]
# PS C:\Users\yazan\Workspace\ralph> 

MAX_ITERATIONS=200
iteration=0

# Colors (disable with NO_COLOR=1)
if [ -t 1 ] && [ -z "$NO_COLOR" ]; then
    C_RESET=$'\033[0m'
    C_DIM=$'\033[2m'
    C_BOLD=$'\033[1m'
    C_GREEN=$'\033[32m'
    C_YELLOW=$'\033[33m'
    C_CYAN=$'\033[36m'
else
    C_RESET=''
    C_DIM=''
    C_BOLD=''
    C_GREEN=''
    C_YELLOW=''
    C_CYAN=''
fi

title() { printf "%b\n" "${C_BOLD}${C_CYAN}$*${C_RESET}"; }
info() { printf "%b\n" "${C_GREEN}$*${C_RESET}"; }
warn() { printf "%b\n" "${C_YELLOW}$*${C_RESET}"; }
muted() { printf "%b\n" "${C_DIM}$*${C_RESET}"; }

ansi_to_html() {
    local text="$1"
    text="${text//\&/\&amp;}"
    text="${text//</\&lt;}"
    text="${text//>/\&gt;}"
    text="${text//\"/\&quot;}"
    text="${text//\\/\\\\}"
    text="${text//\'/\\\'}"
    while [[ "$text" =~ $'\x1b'\[([0-9;]+)m(.*)$'\x1b'\[0m(.*) ]]; do
        local codes="${BASH_REMATCH[1]}"
        local content="${BASH_REMATCH[2]}"
        local rest="${BASH_REMATCH[3]}"
        local classes=""
        IFS=';' read -ra CODE_ARRAY <<< "$codes"
        for code in "${CODE_ARRAY[@]}"; do
            case "$code" in
                0) classes="" ;;
                1) classes="${classes} bold" ;;
                2) classes="${classes} dim" ;;
                31) classes="${classes} red" ;;
                32) classes="${classes} green" ;;
                33) classes="${classes} yellow" ;;
                34) classes="${classes} blue" ;;
                36) classes="${classes} cyan" ;;
                35|37) classes="${classes} magenta" ;;
            esac
        done
        if [[ -n "$classes" ]]; then
            text="<span class=\"$classes\">$content</span>$rest"
        else
            text="$content$rest"
        fi
    done
    [[ -n "$text" ]] && printf '%s\n' "$text" | sed 's/$/<br>/'
}

info "Starting loop..."

# Restrict this loop's opencode calls from touching ralph.sh or .opencode.
OPENCODE_PERMISSION='{"read":{"*":"allow","ralph.sh":"deny",".opencode/**":"deny"},"edit":{"*":"allow","ralph.sh":"deny",".opencode/**":"deny"},"list":{"*":"allow",".opencode":"deny",".opencode/**":"deny"},"glob":{"*":"allow","*ralph.sh*":"deny","*/.opencode/*":"deny","*.opencode*":"deny"},"grep":{"*":"allow","*ralph.sh*":"deny","*.opencode*":"deny"}}'

LOG_DIR="./.ralph"
LOG_FILE="$LOG_DIR/run.txt"
HTML_LOG_FILE="$LOG_DIR/run.html"
STATUS_FILE="$LOG_DIR/status.md"
PROMPT_FILE="$LOG_DIR/generic_prompt.md"
OPENCODE_LOG_LEVEL="${OPENCODE_LOG_LEVEL:-WARN}"

# ensure log dir exists; keep opencode stderr in a log file
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"
echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ralph Logs</title><style>body{font-family:monospace;background:#1e1e1e;color:#d4d4d4;padding:20px}pre{white-space:pre-wrap;word-wrap:break-word}.red{color:#f87171}.green{color:#4ade80}.yellow{color:#facc15}.blue{color:#60a5fa}.cyan{color:#22d3ee}.magenta{color:#e879f9}.dim{opacity:0.6}.bold{font-weight:bold}.reset{}</style></head><body><pre id="log"></pre><script>' > "$HTML_LOG_FILE"

while true; do
    if [ $iteration -ge $MAX_ITERATIONS ]; then
        warn "Reached maximum iterations ($MAX_ITERATIONS). Exiting loop."
        break
    fi

    # CHECK STATUS FILE FOR STOP CONDITION
    if [ ! -f "$STATUS_FILE" ]; then
        warn "Missing $STATUS_FILE. Exiting loop."
        break
    fi
    STATUS=$(grep -o 'Status: [a-zA-Z]*' "$STATUS_FILE" | cut -d' ' -f2)
    STATUS=${STATUS:-unknown}

    if [ "$STATUS" = "done" ] || [ "$STATUS" = "blocked" ]; then
        info "Status is '$STATUS'. Exiting loop."
        cat "$STATUS_FILE"
        break
    fi

    echo
    title "======= RUNNING ITERATION $((iteration + 1)) ======="
    muted "Current status: $STATUS"
    echo

    if [ ! -f "$PROMPT_FILE" ]; then
        warn "Missing $PROMPT_FILE. Exiting loop."
        break
    fi
    prompt=$(cat "$PROMPT_FILE")
    
    info "Executing build..."
    OPENCODE_PERMISSION="$OPENCODE_PERMISSION" \
    opencode run --print-logs --agent build -m zai-coding-plan/glm-4.7 --log-level "$OPENCODE_LOG_LEVEL" "$prompt" 2>&1 | \
    (
        while IFS= read -r line; do
            echo "$line"
            echo "$line" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
            ansi_to_html "$line" >> "$HTML_LOG_FILE"
        done
    )
    echo

    iteration=$((iteration + 1))
done

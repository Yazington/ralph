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

echo "Starting loop..."

# Restrict this loop's opencode calls from touching ralph.sh or .opencode.
OPENCODE_PERMISSION='{"read":{"*":"allow","ralph.sh":"deny",".opencode/**":"deny"},"edit":{"*":"allow","ralph.sh":"deny",".opencode/**":"deny"},"list":{"*":"allow",".opencode":"deny",".opencode/**":"deny"},"glob":{"*":"allow","*ralph.sh*":"deny","*/.opencode/*":"deny","*.opencode*":"deny"},"grep":{"*":"allow","*ralph.sh*":"deny","*.opencode*":"deny"}}'

# ensure log dir exists and tee both stdout and stderr to console + log
mkdir -p ./.ralph
# send stdout to tee (append), and send stderr to tee as well
exec > >(tee -a ./.ralph/run.log) 2> >(tee -a ./.ralph/run.log >&2)

#!/bin/bash
while true; do
    if [ $iteration -ge $MAX_ITERATIONS ]; then
        echo "Reached maximum iterations ($MAX_ITERATIONS). Exiting loop."
        break
    fi

    # CHECK STATUS FILE FOR STOP CONDITION
    STATUS=$(grep -o 'Status: [a-zA-Z]*' STATUS.md | cut -d' ' -f2)

    if [ "$STATUS" = "done" ] || [ "$STATUS" = "blocked" ]; then
        echo "Status is '$STATUS'. Exiting loop."
        cat ./ralph/STATUS.md
        break
    fi

    echo ""
    echo "======= RUNNING ITERATION $((iteration + 1)) ======="
    echo "Current status : $STATUS"
    echo ""
    
    prompt=$(cat ./ralph/generic_prompt.md)
    
    # Stage 1: Generate plan with gpt-5.2-codex
    echo "Generating plan..."
    plan=$(OPENCODE_PERMISSION="$OPENCODE_PERMISSION" opencode run --agent plan -m openai/gpt-5.2-codex --print-logs --log-level DEBUG "$prompt")
    echo "Plan:"
    echo "$plan"
    echo ""
    
    # Stage 2: Execute plan with gpt-5.1-codex-mini
    echo "Executing plan..."
    result=$(OPENCODE_PERMISSION="$OPENCODE_PERMISSION" opencode run --agent build -m openai/gpt-5.1-codex-mini --print-logs --log-level DEBUG "$plan")
    echo "Result:"
    echo "$result"
    echo ""
done

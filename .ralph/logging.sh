#!/bin/bash

init_html_log() {
    local html_file="$1"
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ralph Logs</title><style>body{font-family:monospace;background:#1e1e1e;color:#d4d4d4;padding:20px}.log-line{white-space:pre-wrap;word-wrap:break-word}.red{color:#f87171}.green{color:#4ade80}.yellow{color:#facc15}.blue{color:#60a5fa}.cyan{color:#22d3ee}.magenta{color:#e879f9}.dim{opacity:0.6}.bold{font-weight:bold}</style></head><body><div id="log">' > "$html_file"
}

close_html_log() {
    local html_file="$1"
    echo '</div></body></html>' >> "$html_file"
}

ansi_to_html() {
    local text="$1"
    text=$(printf '%s' "$text" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&#39;/g')
    text=$(printf '%s' "$text" | sed -e 's/\x1b\[0m/<\/span>/g' \
        -e 's/\x1b\[1m/<span class="bold">/g' \
        -e 's/\x1b\[2m/<span class="dim">/g' \
        -e 's/\x1b\[31m/<span class="red">/g' \
        -e 's/\x1b\[32m/<span class="green">/g' \
        -e 's/\x1b\[33m/<span class="yellow">/g' \
        -e 's/\x1b\[34m/<span class="blue">/g' \
        -e 's/\x1b\[36m/<span class="cyan">/g' \
        -e 's/\x1b\[35m/<span class="magenta">/g' \
        -e 's/\x1b\[37m/<span class="white">/g' \
        -e 's/\x1b\[90m/<span class="dim">/g' \
        -e 's/\x1b\[91m/<span class="red">/g' \
        -e 's/\x1b\[92m/<span class="green">/g' \
        -e 's/\x1b\[93m/<span class="yellow">/g' \
        -e 's/\x1b\[94m/<span class="blue">/g' \
        -e 's/\x1b\[96m/<span class="cyan">/g' \
        -e 's/\x1b\[95m/<span class="magenta">/g')
    printf '<div class="log-line">%s</div>\n' "$text"
}
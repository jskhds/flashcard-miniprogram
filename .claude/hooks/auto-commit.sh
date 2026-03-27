#!/bin/bash
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
  exit 0
fi

cat <<'EOF'
{"decision": "block", "reason": "检测到未提交的变更，请调用 /commit 技能提交更新。"}
EOF

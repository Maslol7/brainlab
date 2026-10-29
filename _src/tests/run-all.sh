#!/bin/bash
# Full check of dist/: smoke, feature tests, and every legacy flow test (they must finish without page errors).
cd "$(dirname "$0")/.." ; export NODE_PATH=$(npm root -g); fail=0
for t in smoke bugs goal hints lesson; do node tests/$t.js > /tmp/claude-0/t-$t.txt 2>&1 || { echo "FAIL $t"; tail -5 /tmp/claude-0/t-$t.txt; fail=1; }; done
run() { cd /home/claude/brainlab-src/dist && timeout 150 node -r ../tests/seed.js ../tests/legacy/$1 > /tmp/claude-0/legacy-out/new/$1.txt 2>&1; echo $? > /tmp/claude-0/legacy-out/new/$1.rc; }
export -f run; mkdir -p /tmp/claude-0/legacy-out/new
ls tests/legacy | xargs -P 6 -I{} bash -c 'run {}'
for f in $(ls tests/legacy); do rc=$(cat /tmp/claude-0/legacy-out/new/$f.rc); if [ "$rc" != "0" ] || grep -qE "PE |pageerror|ERRORS [^\[]|Error:" /tmp/claude-0/legacy-out/new/$f.txt; then echo "FAIL legacy $f (rc $rc)"; grep -E "PE |pageerror|Error" /tmp/claude-0/legacy-out/new/$f.txt | head -3; fail=1; fi; done
[ $fail = 0 ] && echo "ALL PASS"; exit $fail

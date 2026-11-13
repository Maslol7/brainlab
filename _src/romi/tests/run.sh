#!/bin/bash
# סלטה (Romi's app): serve dist/pwa and run the flow and cloud tests on /romi/
cd "$(dirname "$0")/../.." ; export NODE_PATH=$(npm root -g); fail=0
(cd dist/pwa && exec python3 -m http.server 8812 >/dev/null 2>&1) & SRV=$!; sleep 1
for t in flow cloud voice vmode; do node romi/tests/$t.js http://localhost:8812/romi/ || { echo "FAIL romi $t"; fail=1; }; done
kill $SRV; exit $fail

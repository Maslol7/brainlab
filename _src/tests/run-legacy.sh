#!/bin/bash
# Run each legacy test against the old build and the new build with a fixed random seed, and compare outputs.
export NODE_PATH=$(npm root -g)
OUT=/tmp/claude-0/legacy-out; mkdir -p $OUT/old $OUT/new
T=/home/claude/brainlab-src/tests
run() { local t=$1; (cd /home/claude/brainlab && timeout 150 node -r $T/seed.js $T/legacy/$t > $OUT/old/$t.txt 2>&1); (cd /home/claude/brainlab-src/dist && timeout 150 node -r $T/seed.js $T/legacy/$t > $OUT/new/$t.txt 2>&1); }
export -f run; export OUT T
ls $T/legacy | xargs -P 6 -I{} bash -c 'run {}'
for f in $(ls $T/legacy); do if cmp -s $OUT/old/$f.txt $OUT/new/$f.txt; then echo "$f same"; else echo "$f DIFF"; fi; done

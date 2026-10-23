#!/bin/sh
set -eu

display_file=$(mktemp)
Xvfb -displayfd 3 -screen 0 1440x1000x24 -nolisten tcp -ac 3>"$display_file" 2>/tmp/timeless-xvfb.log &
display_pid=$!
compositor_pid=
trap 'kill "$display_pid" ${compositor_pid:+"$compositor_pid"} 2>/dev/null || true; rm -f "$display_file"' EXIT INT TERM
attempt=0
while [ ! -s "$display_file" ]; do
  attempt=$((attempt + 1))
  if ! kill -0 "$display_pid" 2>/dev/null || [ "$attempt" -ge 100 ]; then
    echo 'Virtual display did not start' >&2
    exit 1
  fi
  sleep 0.1
done
export DISPLAY=":$(cat "$display_file")"
xcompmgr -n >/tmp/timeless-compositor.log 2>&1 &
compositor_pid=$!
timeout 180s /usr/lib/wine/wine64 timeless_shadcn_test.exe app.js
timeout 180s /usr/lib/wine/wine64 Timeless-Shadcn.exe --test-shadcn app.js

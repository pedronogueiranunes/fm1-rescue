#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")"
if [ "$#" -eq 0 ]; then
  set -- --dry-run
fi
exec /usr/bin/open "$PWD/FM-1 Rescue.app" --args "$@"

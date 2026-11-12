#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")/.."
mkdir -p .review/swift-cache
swiftc -module-cache-path "$PWD/.review/swift-cache"   -framework AppKit -framework WebKit   macos/RescueApp.swift -o 'FM-1 Rescue.app/Contents/MacOS/FM1-Rescue'

#!/bin/sh
# Format all source code

set -e

this_script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="${this_script_dir}/.."

cd "${project_dir}"

command="${1:-write}"
npx prettier "--$command" '*.json' "./{src,tools}/**/*.{ts,tsx,js,jsx,json}"

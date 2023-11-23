#!/bin/bash
# Run config check and build

set -e

this_script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="${this_script_dir}/.."

cd "${project_dir}"

source ./scripts/config.sh

npx vite build

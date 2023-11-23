#!/bin/sh
# Remove all node_modules, build folders, and caches

set -e

this_script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="${this_script_dir}/.."

cd "${project_dir}"

rm -rf ./node_modules
rm -rf ./dist

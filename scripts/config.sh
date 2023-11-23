#!/bin/bash
# Ensure all required env vars are present

set -e

this_script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="${1:-${this_script_dir}/..}"

cd "${project_dir}"

env_file="./.env.${NODE_ENV:-local}"
if [[ -f "${env_file}" ]]; then
    source "${env_file}"
fi

declare -a required_vars=()

error=false

for name in "${required_vars[@]}"
do
    if [ -z "${!name}" ]; then
      echo "Missing required environment variable '${name}'"
      error=true
    fi
done


if [[ $error == true ]]; then
    >&2 echo -e "\033[0;31mERROR: Missing one or more required environment variables\033[0m\\n"
    exit 1
fi

if [ -z "${VAR_WITH_DEFAULT}" ]; then
    export VAR_WITH_DEFAULT="default"
fi

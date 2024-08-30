#!/usr/bin/env bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if at least one argument is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a directory name as the first argument."
    exit 1
fi

# Store the first argument (directory name)
search_dir="$1"

# Shift the arguments to remove the first one
shift

# Define the directories to search in, relative to the script location
directories=("$SCRIPT_DIR/exercises" "$SCRIPT_DIR/projects")

# Function to find the matching directory
find_directory() {
    for dir in "${directories[@]}"; do
        if [ -d "$dir/$search_dir" ]; then
            echo "$dir/$search_dir"
            return 0
        fi
    done
    return 1
}

# Find the matching directory
matched_dir=$(find_directory)

# Check if a matching directory was found
if [ -n "$matched_dir" ]; then
    yarn dev --config "$matched_dir/vite.config.ts" "$@"
else
    echo "Error: No matching directory found in 'exercises' or 'projects'."
    exit 1
fi

#!/bin/bash

# Path to the original package.json in your local folder
local_package_json="/app/package.json"

# Create a temporary directory
temp_dir=$(mktemp -d)

echo "Temporary directory created: "

# Extract taskmanagement_back4-1.0.0.tgz to the temporary directory
tar -xzf taskmanagement_back4-1.0.0.tgz -C "$temp_dir"


# # Path to the extracted package.json from the .tgz file
extracted_package_json="$temp_dir/package/package.json"

# # Print or list files in the extracted directory for verification
echo "Files extracted:"
ls -l "$temp_dir"

# # Compare package.json files
diff_output=$(diff "$local_package_json" "$extracted_package_json")

# Check if there are differences
if [ -n "$diff_output" ]; then
    echo "Differences found:"
    echo "$diff_output"
    rm -rf "$temp_dir"
    echo "Temporary directory deleted: $temp_dir"
    exit 1
else
    echo "No differences found."

     # Copy node_modules directory from extracted package to the original location
    if [ -d "$temp_dir/package/node_modules" ]; then
        cp -r "$temp_dir/package/node_modules" ./node_modules
        echo "node_modules copied from extracted package to current directory."
    else
        echo "No node_modules directory found in the extracted package."
    fi

    # Clean up temporary directory
    rm -rf "$temp_dir"
    echo "Temporary directory deleted: $temp_dir"
fi

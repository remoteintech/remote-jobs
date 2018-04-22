#!/bin/sh

# Only use this script if ALL validation checks are already passing!

old_name="$1"
new_name="$2"

cd "$(dirname "$0")"
cd ..

if [ ! -f "$old_name" ] || [ -f "$new_name" ]; then
	echo "Usage: $0 company-profiles/old-filename.md company-profiles/new-filename.md"
	exit 1
fi

git mv "$old_name" "$new_name"

sed -i "s#/$old_name#/$new_name#" README.md "$new_name"

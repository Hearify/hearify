#!/bin/bash

# Set locale to avoid character encoding issues
export LC_ALL=C

# Function to extract keys recursively from a JSON file
extract_keys() {
  local file="$1"
  grep -o '"[^"]*":\s*[^,}]*' "$file" | sed 's/:.*//g' | tr -d '"' | sort -u
}

# Compare JSON keys in the given files
compare_json_keys() {
  file1="$1"
  file2="$2"

  # Check if files exist
  if [[ ! -f "$file1" || ! -f "$file2" ]]; then
    echo "One or both files do not exist."
    exit 1
  fi

  # Extract and sort all keys from both files
  keys1=$(extract_keys "$file1")
  keys2=$(extract_keys "$file2")

  # Convert keys to arrays
  IFS=$'\n' read -d '' -r -a array1 <<< "$keys1"
  IFS=$'\n' read -d '' -r -a array2 <<< "$keys2"

  # Check for equivalence
  local keys_equivalent=true

  # Get the base names of the files
  local base1=$(basename "$file1")
  local base2=$(basename "$file2")

  # Compare keys from file1 with file2
  for key in "${array1[@]}"; do
    if [[ ! " ${array2[*]} " =~ " $key " ]]; then
      echo "Key '$key' is in $base1 but not in $base2."
      keys_equivalent=false
    fi
  done

  # Compare keys from file2 with file1
  for key in "${array2[@]}"; do
    if [[ ! " ${array1[*]} " =~ " $key " ]]; then
      echo "Key '$key' is in $base2 but not in $base1."
      keys_equivalent=false
    fi
  done

  if $keys_equivalent; then
    echo "Keys are equivalent."
  else
    echo "Keys are not equivalent."
  fi
}

# Static paths for the JSON files
compare_json_keys "./src/assets/en.json" "./src/assets/uk.json"

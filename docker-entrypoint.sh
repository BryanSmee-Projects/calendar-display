#!/bin/sh

# Define the config file path
CONFIG_FILE="/usr/share/nginx/html/config.json"

# Start the JSON object
echo "{" > "$CONFIG_FILE"

# Add CALENDAR_SOURCES if present
if [ -n "$CALENDAR_SOURCES" ]; then
  echo "  \"sources\": $CALENDAR_SOURCES," >> "$CONFIG_FILE"
fi

# Add PROXY_URL if present
if [ -n "$PROXY_URL" ]; then
  echo "  \"proxyUrl\": \"$PROXY_URL\"," >> "$CONFIG_FILE"
fi

# Remove the trailing comma if it exists (simple hack for valid JSON)
# This assumes the last line might have a comma. 
# A more robust way is to construct the JSON properly or use jq if available.
# Since we are in alpine, we might not have jq installed by default.
# Let's try to keep it simple and valid.

# To avoid trailing comma issues, let's add a dummy field at the end.
echo "  \"_generatedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" >> "$CONFIG_FILE"

# Close the JSON object
echo "}" >> "$CONFIG_FILE"

echo "Generated config.json:"
cat "$CONFIG_FILE"

# Execute the CMD
exec "$@"

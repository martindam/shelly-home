#!/bin/bash

# Convenience wrapper for deploy-remote-control.js

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if config file exists
if [ ! -f "remote-control-config.json" ]; then
    echo "Error: remote-control-config.json not found"
    echo "Please create the configuration file first"
    exit 1
fi

# Run the deployment script with all arguments passed through
node deploy-remote-control.js "$@"


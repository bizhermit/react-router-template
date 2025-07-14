#!/bin/bash

echo "node" | sudo -S chown node /workspace/node_modules && sudo -S chmod 777 /workspace/node_modules
echo "node" | sudo -S chown node /workspace/.react-router && sudo -S chmod 777 /workspace/.react-router

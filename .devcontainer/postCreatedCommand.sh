#!/bin/bash

echo "node" | sudo -S chown -R node:node /workspace/node_modules
echo "node" | sudo -S chown -R node:node /workspace/.react-router
echo "node" | sudo -S chown -R node:node /workspace/.playwright

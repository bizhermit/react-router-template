#!/bin/bash

# 依存関係インストール #

npm install

# DB最新化 #

npm run migrate

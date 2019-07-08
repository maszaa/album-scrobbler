#!/usr/bin/env bash

docker-compose build
docker-compose up -d backend frontend postgresql
docker-compose logs --follow backend frontend

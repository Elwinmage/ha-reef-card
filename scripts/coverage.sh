#!/bin/bash

npm run test:coverage
echo $?
head -n 3 reports/cobertura-coverage.xml |grep -oE 'line-rate="\b(0(\.[0-9]+)?|1(\.0+)?)\b"'

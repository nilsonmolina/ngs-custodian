#!/bin/bash
set -eo pipefail

[[ -z "$1" || -z "$2" ]] && echo "usage: clean-cat [data filename] [new filename]" && exit
echo `date` 
echo "Cleaning file..."
time awk -F, '{gsub(/ /,"", $1); gsub(/ /,"", $5); gsub(/\r/,"",$0); $9="CAT"; gsub(/\"/,"",$0); print}' OFS=, $1 > $2 
echo ""
echo `date` 
echo "Validating data..."
echo "- Line count $1 and $2"
wc -l $1
wc -l $2
echo ""
head $1 $2

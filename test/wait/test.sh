#!/bin/sh

echo -n "abcdef"
read -e TEST1
sleep 1
echo -n "abcdef"
read -e TEST2
echo $TEST1$TEST2

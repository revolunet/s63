#!/bin/sh

HOST="pi@192.168.0.27"
#HOST="pi@172.24.1.1"

rsync -av --delete --exclude=node_modules /Users/juju/Documents/projects/prizoners/s63/ $HOST:/home/pi/s63
ssh $HOST -t 'sudo pm2 restart all'
#!/bin/bash
set -e # Any subsequent(*) commands which fail will cause the shell script to exit immediately

# CHECK IF ENV VARIABLES ARE SET
[ -z "$HOST_SERVER_IP" ] && echo "Need to set HOST_SERVER_IP" && exit 1;
[ -z "$HOST_SERVER_USER" ] && echo "Need to set HOST_SERVER_USER" && exit 1;
[ -z "$AWS_KEY_PATH" ] && echo "Need to set HOST_SERVER_USER" && exit 1;
[ -z "$API_PASSWORD" ] && echo "Need to set API_PASSWORD" && exit 1;

# REPLACE LOCALHOST CALLS WITH SERVER CALLS
sed -i -e 's/http:\/\/127.0.0.1:6464\//https:\/\/ngsprices.ml\//g' ./server/public/js/script.js

# COMPRESS FILE, COPY TO SERVER, CLEAN UP
cd ./server
tar czf ngs-custodian.tar.gz server.js package.json package-lock.json ecosystem.config.js utils routes public private
scp -r -i $AWS_KEY_PATH ngs-custodian.tar.gz $HOST_SERVER_USER@$HOST_SERVER_IP:~
rm ngs-custodian.tar.gz

# REVERT TO LOCALHOST CALLS
mv ./public/js/script.js-e ./public/js/script.js

# CONNECT TO SERVER AND CONFIGURE
ssh -i $AWS_KEY_PATH $HOST_SERVER_USER@$HOST_SERVER_IP << 'ENDSSH'
pm2 delete /ngs-custodian*/
rm -rf ngs-custodian
mkdir ngs-custodian
tar xf ngs-custodian.tar.gz -C ngs-custodian
rm ngs-custodian.tar.gz
cd ngs-custodian
npm install
mkdir logs
pm2 start
ENDSSH
#!/bin/bash
set -e # Any subsequent(*) commands which fail will cause the shell script to exit immediately

# CHECK IF ENV VARIABLES ARE SET
[ -z "$HOST_SERVER_IP" ] && echo "Need to set HOST_SERVER_IP" && exit 1;
[ -z "$HOST_SERVER_USER" ] && echo "Need to set HOST_SERVER_USER" && exit 1;
[ -z "$AWS_KEY_PATH" ] && echo "Need to set HOST_SERVER_USER" && exit 1;
[ -z "$API_PASSWORD" ] && echo "Need to set API_PASSWORD" && exit 1;

cd ./server
tar czf ngs-custodian.tar.gz server.js package.json package-lock.json ecosystem.config.js public routes private
scp -r -i $AWS_KEY_PATH ngs-custodian.tar.gz $HOST_SERVER_USER@$HOST_SERVER_IP:~
rm ngs-custodian.tar.gz

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
```bash
$ ssh -i ~/.ssh/aws-kp-2019-02-15.pem ubuntu@3.95.113.35

$ cd /etc/nginx/confd

$ sudo vim ngsprices.ml.conf
```

upstream custodian {
        server localhost:6464;
}

server {
        listen          80;
        listen          [::]:80;
        server_name     ngsprices.ml www.ngsprices.ml;
        # Redirect all HTTP requests to HTTPS with a 301 Moved Permanently response.
        return 301 https://$host$request_uri;
}

server {
        listen          443 ssl; # managed by Certbot
        listen          [::]:443 ssl ipv6only=on; # managed by Certbot
        server_name     ngsprices.ml www.ngsprices.ml;
        root            /home/ubuntu/ngs-custodian/public;

        ssl_certificate /etc/letsencrypt/live/ngsprices.ml/fullchain.pem; # managed by Certbot
        ssl_certificate_key /etc/letsencrypt/live/ngsprices.ml/privkey.pem; # managed by Certbot

        location /api {
                proxy_pass "http://custodian/api";
        }

        error_page 404 /404.html;
                location = /40x.html {
        }
        error_page 500 502 503 504 /50x.html;
                location = /50x.html {
        }
}
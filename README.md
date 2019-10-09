# ngs-custodian
**Site:** [https://www.ngsprices.ml](https://www.ngsprices.ml)  

This tool allows users to upload a txt file containing raw CAT price data, that will then be
parsed, sanitized and updated to be compatible for multiple database systems.

# Server Setup Instructions
## Create New User on Ubuntu Servers
1. Login as root to your server
    ```bash
    $ ssh root@your_server_ip
    ```
1. Create a new user
    ```bash
    $ adduser ubuntu

    Adding user `ubuntu' ...
    Adding new group `ubuntu' (1000) ...
    Adding new user `ubuntu' (1000) with group `ubuntu' ...
    Creating home directory `/home/ubuntu' ...
    Copying files from `/etc/skel' ...
    Enter new UNIX password: 
    Retype new UNIX password: 
    passwd: password updated successfully
    Changing the user information for ubuntu
    Enter the new value, or press ENTER for the default
            Full Name []: 
            Room Number []: 
            Work Phone []: 
            Home Phone []: 
            Other []: 
    Is the information correct? [Y/n] y
    ```
1. Grant administrative priviliges by adding to sudo group
    ```bash
    $ usermod -aG sudo ubuntu
    ```

## Install NPM, Node, & PM2 on Ubuntu server
1. Install the nodejs PPA
    ```bash
    $ curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
    ```

1. Run the script using `sudo`, to add the ppa to your local package cache.
    ```bash
    $ sudo bash nodesource_setup.sh
    ```

1. Install NodeJS 
    ```bash
    $ sudo apt install nodejs pm2
    ```

1. Check Node and NPM versions
    ```bash
    $ node -v
    v10.16.0

    $ npm -v
    6.9.0
    ```

1. In order for some npm packages to work, you will need to install the build-essential package:
    ```bash
    $ sudo apt install build-essential
    ```

1. Install PM2 & configure auto-start on server restart
    ```bash
    $ sudo npm install pm2 -g

    # replace ubuntu and /home/ubuntu with your username and home folder
    $ sudo pm2 startup -u ubuntu --hp /home/ubuntu

    # In order for pm2 to autostart apps on reboot, run all apps in pm2 and then save
    $ sudo pm2 save
    [PM2] Saving current process list...
    [PM2] Successfully saved in /home/ubuntu/.pm2/dump.pm2
    ```
* In order for pm2 to automatically start up your apps, be sure to run `pm2 save` when all the apps you want to auto-start are running. 

## Install Nginx
1. Update local packaging system and install nginx
    ```bash
    $ sudo apt update

    $ sudo apt install nginx
    ```
### Managing Nginx process
- To check if nginx is running:
    ```bash
    $ systemctl status nginx
    ```
- To stop your web server, type:
    ```bash
    $ sudo systemctl stop nginx
    ```
- To start the web server when it is stopped, type:
    ```bash
    $ sudo systemctl start nginx
- To stop and then start the service again, type:
    ```bash
    $ sudo systemctl restart nginx
    ```
- If you are simply making configuration changes, Nginx can often reload without dropping connections. To do this, type:
    ```bash
    $ sudo systemctl reload nginx
    ```
- By default, Nginx is configured to start automatically when the server boots. If this is not what you want, you can disable this behavior by typing:
    ```bash
    $ sudo systemctl disable nginx
    ```
- To re-enable the service to start up at boot, you can type:
    ```bash
    $ sudo systemctl enable nginx
    ```
### Setting Up NGINX Server Blocks  
When using the Nginx web server, server blocks (similar to virtual hosts in Apache) can be used to encapsulate configuration details and host more than one domain from a single server. Some instructions, including the DigitalOcean documentation, setup server blocks using the `sites-available` directory. After doing a bit of research, I prefer to setup server blocks by creating configuration files and putting them in the nginx `/etc/nginx/conf.d` directory. For the example below, an index.html file at `/var/www/ngsprices.ml` will be served.

1.  Create Server Block File for domain
    ```bash
    $ cd /etc/nginx/conf.d

    $ sudo vim ngsprices.ml.conf
    ```

1. Add configuration details
    ```bash
    server {
        listen          80;
        listen          [::]:80
        server_name     ngsprices.ml www.ngsprices.ml;
        root            /var/www/ngsprices.ml;

        location / {
                proxy_pass "http://10.132.70.113:5000/";
        }

        error_page 404 /404.html;
                location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
                location = /50x.html {
        }
    }
    ```

1. Before applying the configuration, test whether it is valid or you could have server downtime. If successful, reload nginx to update the configuration and then check the status.
    ```bash
    $ sudo nginx -t
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful

    $ sudo systemctl reload nginx

    $ sudo systemctl status nginx
    ● nginx.service - A high performance web server and a reverse proxy server
        Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
        Active: active (running) since Mon 2019-06-03 19:43:35 UTC; 11s ago
        ...
    ```
### Free HTTPS w/ Let's Encrypt on NGINX
When deploying to production, SSL/TLS Encryption is a requirement.  Let's Encrypt provides free SSL/TLS Certificates and the certbot tools makes it easy to install, configure and renew your certificates on an nginx web server. After running the below steps, I usually edit the configuration file (/etc/nginx/conf.d/ngsprices.ml.conf) to organize it for better readability.
1. Install Certbot to help automate most of the work.
    ```bash
    # Add the ppa
    $ sudo add-apt-repository ppa:certbot/certbot

    # Install Certbot's nginx package
    $ sudo apt install certbot python-certbot-nginx 
    ```

1. Request a Certificate from certbot
    ```bash
        $ sudo certbot --nginx
        Saving debug log to /var/log/letsencrypt/letsencrypt.log
        Plugins selected: Authenticator nginx, Installer nginx
        Enter email address (used for urgent renewal and security notices) (Enter 'c' to
        cancel): myemailaddress@gmail.com

        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Please read the Terms of Service at
        https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must
        agree in order to register with the ACME server at
        https://acme-v02.api.letsencrypt.org/directory
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        (A)gree/(C)ancel: A

        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Would you be willing to share your email address with the Electronic Frontier
        Foundation, a founding partner of the Let's Encrypt project and the non-profit
        organization that develops Certbot? We'd like to send you email about our work
        encrypting the web, EFF news, campaigns, and ways to support digital freedom.
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        (Y)es/(N)o: Y

        Which names would you like to activate HTTPS for?
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        1: ngsprices.ml
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Select the appropriate numbers separated by commas and/or spaces, or leave input
        blank to select all options shown (Enter 'c' to cancel): 1
        Obtaining a new certificate
        Performing the following challenges:
        http-01 challenge for ngsprices.ml
        Waiting for verification...
        Cleaning up challenges
        Deploying Certificate to VirtualHost /etc/nginx/conf.d/ngsprices.ml.conf

        Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        1: No redirect - Make no further changes to the webserver configuration.
        2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
        new sites, or if you're confident your site works on HTTPS. You can undo this
        change by editing your web server's configuration.
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Select the appropriate number [1-2] then [enter] (press 'c' to cancel): 2
        Redirecting all traffic on port 80 to ssl in /etc/nginx/conf.d/ngsprices.ml.conf

        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        Congratulations! You have successfully enabled https://ngsprices.ml

        You should test your configuration at:
        https://www.ssllabs.com/ssltest/analyze.html?d=ngsprices.ml
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        IMPORTANT NOTES:
        - Congratulations! Your certificate and chain have been saved at:
        /etc/letsencrypt/live/ngsprices.ml/fullchain.pem
        Your key file has been saved at:
        /etc/letsencrypt/live/ngsprices.ml/privkey.pem
        Your cert will expire on 2019-09-01. To obtain a new or tweaked
        version of this certificate in the future, simply run certbot again
        with the "certonly" option. To non-interactively renew *all* of
        your certificates, run "certbot renew"
        - Your account credentials have been saved in your Certbot
        configuration directory at /etc/letsencrypt. You should make a
        secure backup of this folder now. This configuration directory will
        also contain certificates and private keys obtained by Certbot so
        making regular backups of this folder is ideal.
        - If you like Certbot, please consider supporting our work by:

        Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
        Donating to EFF:                    https://eff.org/donate-le
    ```

1. Backup letsencrypt credentials
    ```bash
    $ sudo cp -r /etc/letsencrypt/ ~

    $ sudo tar czf letsencrypt.tar.gz letsencrypt/
    ```

1. Update nginx server block
```bash
    $ cd /etc/nginx/conf.d

    $ sudo vim ngsprices.ml.conf
```
```bash
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
```

More Info Here:
***https://medium.com/@mvuksano/how-to-properly-configure-your-nginx-for-tls-564651438fe0***

### Parsing Nginx Logs with GoAccess
1. Install GoAccess. `apt` has old version, to get latest version use the following commands.
    ```bash
    $ echo "deb http://deb.goaccess.io/ $(lsb_release -cs) main" | sudo tee -a /etc/apt/sources.list.d/goaccess.list

    $ wget -O - https://deb.goaccess.io/gnugpg.key | sudo apt-key add -

    $ sudo apt-get update
    
    $ sudo apt-get install goaccess
    ```
1. Create bash script to convert nginx log config, to be compatible with goAccess Logs
    ```bash
    $ sudo vim nginx2goaccess.sh

    $ sudo chmod 777 nginx2goaccess.sh
    ```
    ```bash
    # Author: Rogério Carvalho Schneider

    # Params
    log_format="$1"

    # Usage
    if [[ -z "$log_format" ]]; then
        echo "Usage: $0 '<log_format>'"
        exit 1
    fi

    # Variables map
    conversion_table="time_local,%d:%t_%^
    host,%v
    http_host,%v
    remote_addr,%h
    request_time,%T
    request_method,%m
    request_uri,%U
    server_protocol,%H
    request,%r
    status,%s
    body_bytes_sent,%b
    bytes_sent,%b
    http_referer,%R
    http_user_agent,%u"

    # Conversion
    for item in $conversion_table; do
        nginx_var=${item%%,*}
        goaccess_var=${item##*,}
        goaccess_var=${goaccess_var//_/ }
        log_format=${log_format//\$\{$nginx_var\}/$goaccess_var}
        log_format=${log_format//\$$nginx_var/$goaccess_var}
    done
    log_format=$(echo "$log_format" | sed 's/${[a-z_]*}/%^/g')
    log_format=$(echo "$log_format" | sed 's/$[a-z_]*/%^/g')

    # Config output
    echo "
    - Generated goaccess config:
    time-format %T
    date-format %d/%b/%Y
    log_format $log_format
    "

    # EOF
    ```

1. Convert nginx log format to goaccess config
    ```bash
    $ ./nginx2goaccess.sh '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent $request_time "$http_referer" "$http_user_agent"';

    - Generated goaccess config:
    time-format %T
    date-format %d/%b/%Y
    log_format %h - %^ [%d:%t %^] "%r" %s %b %T "%R" "%u"
    ```

1. Run goaccess with this configuration. I saved this command in a script to make calling it easier.  You can also put these settings in the configuration file for goaccess.
    ```bash
    $ goaccess /var/log/nginx/access.log --time-format='%T' --date-format='%d/%b/%Y' --log-format='%h - %^ [%d:%t %^] "%r" %s %b %T "%R" "%u"'
    ```

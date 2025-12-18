# sudo systemctl stop nginx
# sudo certbot certonly --standalone 
# sudo systemctl start nginx

# ssh -p '37018' 'grig@dmitriy.space'


# server {
#         listen 80;
#         listen [::]:80;
#         server_name chartfolio.me;
#         return 301 https://chartfolio.me$request_uri;
# }

# server {
#         client_max_body_size 100M;
#         listen 443 ssl;
#         listen [::]:443 ssl;    
#         server_name chartfolio.me;
#         ssl_certificate /etc/letsencrypt/live/chartfolio.me/fullchain.pem;
#         ssl_certificate_key /etc/letsencrypt/live/chartfolio.me/privkey.pem;
#         ssl_protocols TLSv1.2 TLSv1.3;

#         location / {
#                 proxy_pass http://127.0.0.1:3000;
#         }
#         location /api {
#                 proxy_pass http://127.0.0.1:4000/api;
#         }
#         location /auth {
#                 proxy_pass http://127.0.0.1:4000/auth;
#         }
# }

# ln -s /etc/nginx/sites-available/chartfolio.me /etc/nginx/sites-enabled/
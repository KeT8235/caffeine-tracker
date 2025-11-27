server {
    listen 80;
    server_name caffeine.jeiu.cc;

    root /var/www/caffeine;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
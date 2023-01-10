FROM nginx:mainline-alpine

WORKDIR /home/nicholas/Desktop/mygene/intro_jan/nginx-standalone2

COPY ./public /var/www/html/
COPY ./default.conf /etc/nginx/conf.d/

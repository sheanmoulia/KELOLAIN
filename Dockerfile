FROM node:22-bookworm-slim AS node

FROM composer:2 AS composer-bin

FROM php:8.4-apache-bookworm AS app
WORKDIR /var/www/html
ENV PORT=8080 \
    APP_ENV=production \
    APP_NAME=KELOLAIN \
    APP_LOCALE=id \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/data/database.sqlite \
    CACHE_STORE=database \
    SESSION_DRIVER=database \
    SESSION_SECURE_COOKIE=true \
    MAIL_MAILER=array
RUN a2enmod rewrite headers \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY deploy/apache.conf /etc/apache2/sites-available/000-default.conf

FROM app AS build
COPY --from=composer-bin /usr/bin/composer /usr/local/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN apt-get update && apt-get install -y --no-install-recommends unzip git libstdc++6 \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
COPY . .
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
RUN npm ci && VITE_APP_NAME=KELOLAIN npm run build

FROM app AS production
COPY . .
COPY --from=build /var/www/html/vendor ./vendor
COPY --from=build /var/www/html/public/build ./public/build
COPY deploy/start.sh /usr/local/bin/kelolain-start
RUN chmod 755 /usr/local/bin/kelolain-start \
    && chown -R www-data:www-data storage bootstrap/cache
EXPOSE 8080
CMD ["kelolain-start"]

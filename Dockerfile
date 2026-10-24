FROM php:8.3-cli-bookworm AS php-build

RUN apt-get update \
    && apt-get install -y --no-install-recommends libicu-dev libpq-dev libzip-dev \
    && docker-php-ext-install intl pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --no-autoloader \
    --prefer-dist

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs

RUN composer dump-autoload \
    --no-dev \
    --no-interaction \
    --optimize \
    --classmap-authoritative

FROM php-build AS frontend-build

COPY --from=node:22-bookworm-slim /usr/local/ /usr/local/

ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https
ARG VITE_APP_NAME="AMS Portal"

ENV VITE_APP_NAME=${VITE_APP_NAME} \
    VITE_REVERB_APP_KEY=${VITE_REVERB_APP_KEY} \
    VITE_REVERB_HOST=${VITE_REVERB_HOST} \
    VITE_REVERB_PORT=${VITE_REVERB_PORT} \
    VITE_REVERB_SCHEME=${VITE_REVERB_SCHEME}

WORKDIR /var/www/html

RUN npm ci --no-audit --no-fund

RUN npm run build

FROM php:8.3-apache-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends libicu-dev libpq-dev libzip-dev \
    && docker-php-ext-install intl opcache pcntl pdo_pgsql zip \
    && a2enmod headers rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/ams-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/ams-entrypoint \
    && chmod +x /usr/local/bin/ams-entrypoint

WORKDIR /var/www/html

COPY --from=php-build --chown=www-data:www-data /var/www/html ./
COPY --from=frontend-build --chown=www-data:www-data /var/www/html/public/build ./public/build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 10000

ENTRYPOINT ["/bin/sh", "/usr/local/bin/ams-entrypoint"]
CMD ["apache2-foreground"]

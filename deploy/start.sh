#!/bin/sh
set -eu

: "${APP_KEY:?Tetapkan APP_KEY Laravel yang tetap di konfigurasi hosting.}"
if [ -z "${APP_URL:-}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
    export APP_URL="https://$RAILWAY_PUBLIC_DOMAIN"
fi
: "${APP_URL:?Tetapkan APP_URL ke alamat web KELOLAIN.}"

case "$PORT" in
    ''|*[!0-9]*) echo 'PORT harus berupa angka.' >&2; exit 1 ;;
esac
sed -i -E "s/^Listen [0-9]+/Listen $PORT/" /etc/apache2/ports.conf
sed -i -E "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/000-default.conf

data_dir=$(dirname "$DB_DATABASE")
mkdir -p "$data_dir"
chown www-data:www-data "$data_dir"
chmod 0750 "$data_dir"

su -s /bin/sh www-data -c 'umask 027 && touch "$DB_DATABASE"'
su -s /bin/sh www-data -c 'php artisan migrate --force --no-interaction'
su -s /bin/sh www-data -c 'php artisan config:cache --no-interaction'
su -s /bin/sh www-data -c 'exec php artisan schedule:work --no-interaction' &

exec apache2-foreground

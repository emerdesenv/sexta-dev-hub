#!/bin/sh

mkdir -p /db_backups

while true
do
  TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
  FILE="/db_backups/sextadev_${TIMESTAMP}.sql"

  echo "Iniciando backup em $FILE"

  mysqldump \
    -h mysql \
    -u"${MYSQL_USER}" \
    -p"${MYSQL_PASSWORD}" \
    "${MYSQL_DATABASE}" > "$FILE"

  echo "Backup concluído: $FILE"

  find /db_backups -type f -name "*.sql" -mtime +7 -delete

  sleep 86400
done
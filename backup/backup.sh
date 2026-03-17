#!/bin/sh

mkdir -p /db_backups

while true
do
  TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
  FILE="/db_backups/sextadev_${TIMESTAMP}.sql"

  echo "Iniciando backup em $FILE"

  if mysqldump \
    --no-tablespaces \
    -h mysql \
    -u"${MYSQL_USER}" \
    -p"${MYSQL_PASSWORD}" \
    "${MYSQL_DATABASE}" > "$FILE"
  then
    echo "Backup concluído: $FILE"
    find /db_backups -type f -name "*.sql" -mtime +7 -delete
  else
    echo "Erro ao gerar backup"
    rm -f "$FILE"
  fi

  sleep 86400
done
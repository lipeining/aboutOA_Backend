#!/bin/bash
MYSQL_ROOT_PASSWORD=admin
docker-compose up -d
sleep 2
#docker exec db mysqladmin --silent --wait=30 -uroot -padmin ping || exit 1
#docker-compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD < /usr/local/mysql.sql"
#docker-compose exec mysql sh -c "mysql -uroot -padmin < /usr/local/mysql.sql"

docker-compose exec mysql sh -c "mysql -uroot -padmin < update mysql.user set authentication_string=password('xxx'),plugin='mysql_native_password' where user='root';"

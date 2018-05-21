
1. docker-compose start mysql
2. docker-compose exec mysql sh -c "mysql -uroot -padmin < /usr/local/mysql.sql"
3. docker-compose up -d
4. done

how to set the default password 
redis: 
  in redis.conf ,set the requirepass 
  and uncomment bind 127.0.0.1 which set redis connection only from localhost
mysql:
  in docker-compose.yml set the MYSQL_ROOT_PASSWORD

how about try to use findCreateFind method?  














    command: "-uroot -p$MYSQL_ROOT_PASSWORD < /usr/local/mysql.sql"

    shell script
    #!/bin/bash
    docker-compose up
    MYSQL_ROOT_PASSWORD=admin
    docker-compose exec mysql sh -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD < /usr/local/mysql.sql"

redis.conf
need to reset 
requirepass XXXX
and uncomment bind 127.0.0.1 which set redis connection only from localhost  














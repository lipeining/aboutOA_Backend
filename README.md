
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

gm "identify" "-ping" "-format" "%[EXIF:Orientation]" 
"/home/node/app/public/images/logo/2018-05-22T07:28:24.164Z-windows.jpg"
this most likely means the gm/convert binaries can't be found
in the docker ,we did not  install the graphicsmagick so ,it's not found!

docker-compose exec aboutoa bash
root#apt-get update
root#apt-get install graphicsmagick

after install 
go out and use docker commit to save the container
by the way ,you can create a image with graphicsmagick already installed 










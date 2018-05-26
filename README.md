
## introduction
it's the backend of aboutOA project,with express, sequelize, mysql, redis, docker<br>
mainly, it just provide API to [aboutOA_Vue](https://github.com/lipeining/aboutOA_Vue)


## git set up project

``` bash
git clone the project
npm install
// cnpm install
// you can use docker to set up the project, or without it!
```

### how to install aboutoa without docker 

#### about config
by default, the mysql server should be mysql:5.7 . take a look at /config/config.js 
you can set your own config<br>
for the redis service , take a look at redis.conf ,about the requirepass.the version
should be at least 3.0.<br>

``` bash
// before start the sevice, make sure you have set the config of mysql and redis 
// create a database named aboutoa, use the followed sql.
create database `aboutoa` default character set utf8mb4 collate utf8mb4_unicode_ci;
// after that
npm start
```

### how to install aboutoa with docker

how to set the default password <br>
redis:   in redis.conf ,set the requirepass <br>
  and uncomment bind 127.0.0.1 which set redis connection accept from localhost <br>
mysql:   in docker-compose.yml set the MYSQL_ROOT_PASSWORD<br>
  
at first, you should create an image with node-8 and gm software,otherwise,<br>
you should update the aboutoa service in the docker-compose.<br>
#### create an image with node-8 and gm software.
``` bash
docker pull node:8
docker run  -d --name node-8-gm-test node:8
docker container exec -it node-8-gm-test bash
// now we are in the docker container node-8-gm-test
// just install the gm 
#apt-get update
#apt-get install graphicsmagick
// after install we can exit and commit the docker container to make a new image
docker container ls 
CONTAINER ID        IMAGE               COMMAND                  CREATED              STATUS              PORTS                    NAMES
900c812c0abd        node:8              "node"                   About a minute ago   Up 23 seconds                                node-8-gm-test
docker commit 900c812c0abd node-8-gm:1.0 
// the container id maybe  different . my node-8-gm-test container id is 900c812c0abd 
// change it to yours
docker images
// now you should have an image named node-8-gm and taged 1.0
REPOSITORY                                     TAG                 IMAGE ID            CREATED             SIZE
node-8-gm                                      1.0                 a99fa07973f0        4 seconds ago       744MB
// therefore , you should update the docker-compose.yml 
// just set the aboutoa.image: "node-8-gm:1.0"
// and then just follow the setup steps!
version: '3'

services:
  aboutoa:
    image: "node-8-gm:1.0"
    ...
```
### setup steps 
``` bash
// first change docker-compose service mysql 
// volumes:
        - /home/said/aboutOA/datadir:/var/lib/mysql
// change the datadir path to your own path
docker-compose up -d

// the password is set in the docker-compose.yml,if you have change it,satify the follow
// bash script to yourself, just change the 'mysql -uroot -pXXXX < /usr/local/mysql.sql'
docker-compose exec mysql sh -c "mysql -uroot -padmin < /usr/local/mysql.sql"
// wait a second 

// docker-compose restart aboutoa

```
#### update the aboutoa service in docker-compose
``` bash
// just after set up the project with docker-compose, maybe you would get the error like this
// gm "identify" "-ping" "-format" "%[EXIF:Orientation]" 
// "/home/node/app/public/images/logo/2018-05-22T07:28:24.164Z-windows.jpg"
// this most likely means the gm/convert binaries can't be found

// because in the aboutoa service,we did not  install the graphicsmagick so ,it's not found!

docker-compose exec aboutoa bash
root#apt-get update
root#apt-get install graphicsmagick
root#exit
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
// for example
docker commit backend_aboutoa_1 backend-node-8-gm:1.0
// so change the image of docker-compose - services-aboutoa
version: '3'

services:
  aboutoa:
    image: "backend-node-8-gm:1.0"
    ...
    
you should stop the aboutoa and rm it.
docker-compose stop aboutoa
docker-compose rm aboutoa
// now start the aboutoa ,the image would change!
docker-compose up -d
```

## how to import aboutOA_Vue into aboutOA_Backend

// first build up the Vue project into dist
``` bash
npm run build
// after this, mv the dist directory to Backend directory
mv -r path/to/dist/ path/to/backend/
// and then change some line in app.js
// add dist after public line 36 app.js 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist'))); 

```
now you can open localhost:3000 to use it!

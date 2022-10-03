/*
Pod commands
cd /
mkdir /tst
cd /tst
npm init -y
npm i ioredis@3.2.2
apt-get install vim -y
vi index.js

-- copy paste, close
node index.js > app.log

-- open another shell of same pod
tail -f /tst/app.log | grep 2828

*/


const Redis = require('ioredis');
const redisHost = [ {
	host: '',
	port: 6379
} ];
const redisOptions = {
	redisOptions: {
		password: ''
	}
};
let cache = new Redis.Cluster(redisHost, redisOptions);

setTimeout(async () => {
    try {
        console.log(2828, await cache.get('profile/croppedImage/586'));
    } catch (err) {
        console.log(2828, err.message);
    }
}, 10000);
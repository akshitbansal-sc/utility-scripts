const Redis = require('ioredis');
const { get, put } = require('../rocksdb/index');
const hosts = ``.split(',')
    .map((el) => {
        return {
            host: el,
            port: 6379,
        }
    })
const redisOptions = {
	redisOptions: {
		password: ''
	}
};



let cache = new Redis.Cluster(hosts, redisOptions, { scaleReads: 'all' });

const posts = [ '123' ];
const id = 'CREATOR-UNDERPERFORMING/UnderPerformingInfluencersQueryMoj2';
const id1 = 'dct*';
(async function() {
    console.log(await cache.get(id));
    console.log(await cache.set('post/croppedImage/3108946584', JSON.stringify({
        image: 'https://cdn-stag.sharechat.com/4c7fac97-2dca-4bbc-a2ca-5c96e9184d78_original_keyframe_00_02.jpg',
        thumb: 'https://cdn-stag.sharechat.com/4c7fac97-2dca-4bbc-a2ca-5c96e9184d78_original_keyframe_00_02.jpg',
    })));
})()


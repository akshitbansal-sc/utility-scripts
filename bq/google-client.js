// const constants = require('../constants');
const { BigQuery } = require('@google-cloud/bigquery');
const bigQuery = new BigQuery({projectId: 'moj-prod'});
const {Bigtable} = require('@google-cloud/bigtable');
const request = require('request');
const Redis = require('ioredis');
const axios = require('axios').create({
	timeout: 4000
});
Promise.prototype.invoke = function() {
    return this.then(res => [res, null]).catch(err => [null, err]);
}
const redisHost = [ {
    host: 'redis-17094.internal.c16993.asia-seast1-mz.gcp.cloud.rlrcp.com',
    port: 17094
} ];
const redisOptions = {
    redisOptions: {
        password: 'ux3EReKdfXBbUL0yp0b9SlflMb1jZqhn'
    }
};
notificationUserCache = new Redis.Cluster(redisHost, redisOptions);
// const {Spanner} = require('@google-cloud/spanner');
// const redis = new require('ioredis')();

const query = 'select distinct postid from maximal-furnace-783.data_extraction.postidsfromCluster where dt = current_date("Asia/Kolkata")';

async function getQueryJobObject(query) {
    const [ job ] = await bigQuery.createQueryJob({ query: query, labels: [] });
    return await new Promise((resolve, reject) => {
        job.on('complete', async (metadata) => {
            return resolve(job);
        });
        
        job.on('error', (err) => {
            return reject(err);
        });
    });
}

async function fetchQueryResults(job, pageToken, maxFetchLimit) {
    const options = {
        maxResults: maxFetchLimit
    };
    if (pageToken) {
        options.pageToken = pageToken;
    }
    const data = await job.getQueryResults(options);
    return { usersInfo: data[0], pageToken: data[2].pageToken };
}

async function getData(query) {
    const postIds = {};
    const start = Date.now();
    let job = null;
    try {
        job = await getQueryJobObject(query);
    } catch (e) {
        console.log(e.message);
    }

    let pageToken = null, dataObj, data, totalFetches = 0;
    do {
        try {
            dataObj = await fetchQueryResults(job, pageToken, 500);
        } catch (e) {
            console.log(e.message);
            return;
        }
        data = dataObj.usersInfo;
        if (!data || data.length === 0) {
            continue;
        }
        // data = dataObj.data;
        totalFetches = totalFetches + data.length;
        pageToken = dataObj.pageToken;
        for (let entry of data) {
            postIds[entry.postid] = 1;
        }
    } while (pageToken);
    console.log('Time took to fetch all posts:', (Date.now() - start) / 1000);
    // console.log(postIds);
    return postIds;
}

async function getPosts(userId, language, gender, recommendedPostsResponseCount) {
    const reqBody = {
        userId,
        language,
        gender,
        variant: 'ffm_only_v2',
        expName: 'SCContentRelevance12',
        limit: recommendedPostsResponseCount
    };
    const headers = {};
    headers['Content-Type'] = 'application/json';

    const options = {
        method: 'POST',
        url: `http://moj-feed-relevance.moj.internal/NotifV1/notification`,
        data: reqBody,
        headers,
        json: true,
        forever: true
    };

    try {
        const response = await axios(options);
        return response.data ? response.data : [];
    } catch (err) {
        if (err && err.response && err.response.data) {
            return Promise.reject(JSON.stringify({ status: err.response.status, 
                message: err.response.data, headers: err.response.headers } ));
        }
        return Promise.reject(JSON.stringify({ message: err.message, code: err.code }));
    }
}

async function getUserInfo(userIds) {
    const failedUserIds = [];
    const usersInfo = [];
    const prs = [];
    for (const userId of userIds) {
        try {
            prs.push(notificationUserCache.get(`uid:${userId}`).catch(e => {
                console.error(e);
            }));
        } catch (err) {
            failedUserIds.push(userId);
        }
    }
    const result = await Promise.all(prs);
    for (let i= 0; i < result.length; i++) {
        if (result[i] instanceof Error) {
            failedUserIds.push(userIds[i]);
            continue;
        }
        try {
            const userData = JSON.parse(result[i]);
            if (!userData || Object.keys(userData).length === 0) {
                continue;
            }
            usersInfo.push({
                userId: userIds[i],
                gender: userData.gnr
            });
        } catch (e) {
            console.log(e.message);
            failedUserIds.push(userIds[i])
        }
    }

    if (failedUserIds.length === 0) {
        return usersInfo;
    }
    const params = {
        userIds: failedUserIds,
        projections: ['gender', 'userId']
    };
    const options = {
        url: `http://user-service.moj.internal/user-service/v1.0.0/users/data`,
        method: 'GET',
        headers: { 'X-SHARECHAT-CALLER': 'notification-service' },
        json:true,
        forever: true,
        qs: params,
        qsStringifyOptions: { indices: false }
    };
    return await new Promise(async (resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            if (response.statusCode !== 200) {
                return reject('user-service responded with status code' +
            `${JSON.stringify(response.statusCode)}, responseBody:${JSON.stringify(body)}`);
            }
            if (!body || !Array.isArray(body.users) || !body.users.length) {
                return reject('user-service response - user data not found');
            }
            return resolve(body.users);
        });
    });
}
async function getPostsForUser(userId, language, gender, postIds) {
    let i = 0;
    while (i < 3) {
        let postList;
        [ postList, err ] = await getPosts(userId, 'Hindi', gender, 300).invoke();
        if (!err) {
            return {
                userId: userId,
                postsFromDs: postList.length,
                matchingRecords: postList.filter(post => (post.postId in postIds)).length,
                gotResultFromDs: 1
            };
        } else {
            // console.log(userId, language, gender);
            return {
                userId,
                postsFromDs: 0,
                matchingRecords: 0,
                gotResultFromDs: 0
            }
        }
    }
    return 0;
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './out.csv',
  header: [
    {id: 'userId', title: 'userId'},
    {id: 'matchingRecords', title: 'matchingRecords'},
    {id: 'gotResultFromDs', title: 'gotResultFromDs'},
    {id: 'postsFromDs', title: 'postsFromDs'},
  ]
});
async function writeToCSV(userPostMappings) {
    let data = userPostMappings;
    await csvWriter
        .writeRecords(data);
}

async function getBqUsersAndMatch(postIds) {
    let mauBtClient = new Bigtable({ projectId: 'moj-prod' })
            .instance('production-bt-3').table('mauNotificationsV2');
    const languages = ['Hindi'];
    let total = 0;
    try {
        let userIds = [];
        let userDetailsPromises = [];
        let start = Date.now();
        for (let j = 0; j < languages.length; j++) {
            for (let i = 0; i < 1; i++) { // TODO all shards
                const prefix = `${i}_${languages[j]}#`;
                console.log(prefix, 'started');
                const readStream = await mauBtClient.createReadStream({
                    decode: false,
                    prefix,
                    filter: [ //TODO set filter
                        {
                            column: {
                                cellLimit: 1,
                            },
                        }
                    ]
                });
                for await (const row of readStream) {
                    const userId = row.data.a1.userId[0].value.readDoubleBE(0);
                    const expire = row.data.a1.expire[0].value.readDoubleBE(0);
                    // const exp = new Date(expire*1000);
                    // console.log(exp, new Date(Date.now() + 46 * 24 * 60 * 60 * 1000));
                    // console.log(expire, Date.now() + 46 * 24 * 60 * 60 * 1000);
                    if (expire * 1000 < Date.now() + 62 * 24 * 60 * 60 * 1000) {
                        continue;
                    }
                    // ---- userId | postsMatched
                    userIds.push(userId.toString());
                    if (userIds.length === 150) {
                        userDetailsPromises.push(getUserInfo(userIds));
                        userIds = [];
                    }
                    if (userDetailsPromises.length === 3) {
                        const userDetailsResult = await Promise.all(userDetailsPromises);
                        const userDetails = [];
                        for (let k = 0; k < userDetailsResult.length; k++) {
                            userDetails.push(...userDetailsResult[k]);
                        }
                        const pr = [];
                        for (let userDetail of userDetails) {
                            pr.push(getPostsForUser(userDetail.userId, userDetail.language, userDetail.gender, postIds));
                        }
                        const result = await Promise.all(pr);
                        const userMappings = result;
                        await writeToCSV(userMappings);
                        userDetailsPromises = [];
                    }
                    if (total % 10000 === 0) {
                        console.log('processed 10000 in', (Date.now() - start) / 1000);
                        start = Date.now();
                    }
                    if (total === 100000) {
                        break;
                    }
                    // console.log(total);
                    total++;
                }
            }
        }
        console.log('total', total);
    } catch (e) {
        console.log(e);
    }   
}


(async () => {
    const postIds = await getData(query);
    await getBqUsersAndMatch(postIds);
})();
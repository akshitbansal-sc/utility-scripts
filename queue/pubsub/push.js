
const timeout = 100;
const fs = require('fs');
const zlib = require('zlib');


const { PubSub } = require('@google-cloud/pubsub');

async function push(
    projectId,
    topic,
    msg
) {
    const pubSubClient = new PubSub({ projectId });
    const buf = Buffer.from(JSON.stringify(msg));
    await pubSubClient.topic(topic).publish(buf).then(() => {
        console.log('done', msg);
    });
}

// push();

module.exports = push;

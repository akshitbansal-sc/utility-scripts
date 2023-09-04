const timeout = 10000;
const fs = require('fs');
const { unzip } = require('zlib');
const unzipAsync = require('util').promisify(unzip);

const { PubSub } = require('@google-cloud/pubsub');

function listenForMessages(
        projectId = 'moj-stag',
        subsription = 'notif-dispatch-normal-throughput-test',
        ack = false,
        callback = (msg) => { console.log(msg);}
    ) {
    const pubSubClient = new PubSub({ projectId });
	const subscription = pubSubClient.subscription(subsription);

	let messageCount = 0;
	const messageHandler = async (message) => {
        const isCompressed = message.attributes?.c;
        let msg;
        if (isCompressed) {
            msg = await unzipAsync(message.data).then((d) => {
                return d.toString();
            }).catch((err) => {
                console.log(err.message);
            });
        } else {
            msg = message.data.toString();
        }
        callback(msg);
        messageCount++;
		if (ack) {
            message.ack();
        }
	};

	subscription.on('message', messageHandler);

	setTimeout(() => {
		subscription.removeListener('message', messageHandler);
		console.log(`${messageCount} message(s) received.`);
	}, timeout * 1000);
}

listenForMessages();

module.exports = listenForMessages;

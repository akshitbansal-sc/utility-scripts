
const timeout = 12;
const fs = require('fs');


const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub({ projectId: 'moj-stag' });

const set = new Set();
function listenForMessages() {
    // pubSubClient.subscription
	const subscription = pubSubClient.subscription('creator-influencer-data-queue-test');

	let messageCount = 0;
	const messageHandler = (message) => {
        const key = (message.data.toString());
        console.log(key);
        // process.exit(0);
        // set.add(key);
        messageCount++;
		// "Ack" (acknowledge receipt of) the message
		// message.ack();
	};

	// Listen for new messages until timeout is hit
	subscription.on('message', messageHandler);

	setTimeout(() => {
        console.log(set);
		subscription.removeListener('message', messageHandler);
		console.log(`${messageCount} message(s) received.`);
	}, timeout * 1000);
}

listenForMessages();


const timeout = 10;


const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub({ projectId: 'moj-stag' });

function listenForMessages() {
	const subscription = pubSubClient.subscription('notif-dispatch-low-throughput');

	let messageCount = 0;
	const messageHandler = (message) => {
		console.log(`Received message ${message.id}:`);
		console.log(`\tData: ${message.data}`);
		console.log(`\tAttributes: ${message.attributes}`);
		messageCount = messageCount + 1;

		// "Ack" (acknowledge receipt of) the message
		// message.ack();
	};

	// Listen for new messages until timeout is hit
	subscription.on('message', messageHandler);

	setTimeout(() => {
		subscription.removeListener('message', messageHandler);
		console.log(`${messageCount} message(s) received.`);
	}, timeout * 1000);
}

listenForMessages();
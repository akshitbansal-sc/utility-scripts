let shouldAck;
let timeout; // seconds after which we stop pulling
let project;
let throughput;
const { PubSub } = require('@google-cloud/pubsub');
let pubSubClient;

const getPipeline = (throughput) => [
    `notif-gateway-${throughput}-throughput-test`,
    `fcm-${throughput}-throughput-test`,
    `notif-dispatch-${throughput}-test`,
];

function listenForMessages(sub) {
    return new Promise((res) => {
        const subscription = pubSubClient.subscription(sub);

        const messageHandler = (message) => {
            const key = (message.data.toString());
            console.log(key);
            if (shouldAck) {
                message.ack();
            }
        };

        // Listen for new messages until timeout is hit
        subscription.on('message', messageHandler);

        setTimeout(() => {
            subscription.removeListener('message', messageHandler);
            res();
        }, timeout * 1000);
    });
}

const pull = async () => {
    pubSubClient = new PubSub({ projectId: project });
    for (const sub of getPipeline(throughput)) {
        await listenForMessages(sub);
    }
}

shouldAck = false;
timeout = 12;
project = 'moj-stag';
throughput = 'normal';
pull();
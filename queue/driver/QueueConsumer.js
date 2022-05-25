const constants = require('../../constants');
const queueDriver = require('queue-driver');
class QueueConsumer {

    constructor() {
        this.consumer = queueDriver.consume(constants.project.serviceName);
        this.subscription = 'notification_user_attributes_mau';
    }

    async consumeMessages() {

        try {
            const messages = await  new Promise((resolve, reject) => {
                const params = {
                    ResourceName: this.subscription
                };
                this.consumer.receiveMessage(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data.Messages);
                });
            });
            messages.map(m => {
                console.log(JSON.parse(m.Body));
            });
        } catch (e) {
            console.error(e);
        }
    }

}

new QueueConsumer().consumeMessages();
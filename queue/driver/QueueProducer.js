const constants = require('../../constants');
const queueDriver = require('queue-driver');
const {v4: uuid} = require('uuid');
class QueueConsumer {

    constructor() {
        this.publisher = queueDriver.publish(constants.project.serviceName);
        this.topicName = 'notification_user_attributes_mau';
    }

    async consumeMessages() {

        try {
            const payload = [{
                MessageBody: JSON.stringify({
                    p: 'testPayload',
                    userId: uuid()
                }),
                Id: 1
            }];
            await new Promise((resolve, reject) => {
                const params = {
                    Entries: payload,
                    ResourceName: this.topicName
                };
                this.publisher.publishMessageBatch(params, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(true);
                });
            });
            console.log('done');
        } catch (e) {
            console.error(e);
        }
    }

}

new QueueConsumer().consumeMessages();
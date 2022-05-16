**To configure secret file to pick to be used as credentials for gcloud**
```
GOOGLE_APPLICATION_CREDENTIALS=<PATH_TO_CONFIG>
```


## fcm payload creator
#### Place holders
* <ENV> environment
* <PROJECT_NAME> project name
* <INPUT_QUEUE_NAME> input queue from gateway
* <OUTPUT_QUEUE_NAME> output queue name to dispatch
```
ACTIVE_ENV=<ENV> CLOUD_PROVIDER=GCP PROJECT_NAME=<PROJECT_NAME> PUBLISH_BATCH_SIZE=1000 PUBLISH_PROMISE_BATCH_SIZE=2 FCM_PAYLOAD_ACCUMULATOR_SUBSCRIPTION=<INPUT_QUEUE_NAME> NOTIF_DISPATCH_TOPIC=<OUTPUT_QUEUE_NAME> node --inspect index.js
```
**You can change the batch size and queue names as well as per your requirements**

## segment data streaer
#### Place holders
* <ENV> environment
* <PROJECT_NAME> project name
```
ACTIVE_ENV=<ENV> CLOUD_PROVIDER=GCP PROJECT_NAME=<PROJECT_NAME> PUBLISH_BATCH_SIZE=1000 PUBLISH_PROMISE_BATCH_SIZE=50 node --inspect index.js
```

function sort(object){
    if (typeof object != "object" || object instanceof Array) // Not to sort the array
        return object;
    var keys = Object.keys(object);
    keys.sort();
    var newObject = {};
    for (var i = 0; i < keys.length; i++){
        newObject[keys[i]] = sort(object[keys[i]])
    }
    return newObject;
}

const obj = {"data":{"notifType":"ALARM","notifId":"e4abcf1c-f464-4c95-a42e-7d503393f46f","userId":"50101467","nbd":{"deliveryChannels":["FCM"],"senderName":"dormantUser","data":{"action_type":"home_open","language":"English"}},"fcm":{"default_payload":{"msg":{"d":["🥰😍","Awwwww !!!","https://cdn.sharechat.com/9ff4f9d4-f78c-44f8-9ccd-397a28a6303d-2f712ff4-7ea6-401b-9f56-b785205154ee_thumb.jpg"],"f":["🥰😍","Awwwww !!!","https://cdn.sharechat.com/9ff4f9d4-f78c-44f8-9ccd-397a28a6303d-2f712ff4-7ea6-401b-9f56-b785205154ee_thumb.jpg"],"notificationIcon":"","notificationThumb":"https://cdn.sharechat.com/9ff4f9d4-f78c-44f8-9ccd-397a28a6303d-2f712ff4-7ea6-401b-9f56-b785205154ee_thumb.jpg","subType":"moj_trending_webhook","actionData":{"action":"open_activity","type":"home","postId":"101","postHash":"J73","referrer":"alarmContentPost"},"communityNotifId":"content/random/noPostFromFeed/Romance & Heartbreak/101/cta/Romance & Heartbreak/261","t":75,"lt":55,"ti":1675955336,"cn":"alarm-push","notificationLargeImage":"https://cdn.sharechat.com/9ff4f9d4-f78c-44f8-9ccd-397a28a6303d-2f712ff4-7ea6-401b-9f56-b785205154ee_thumb.jpg","frame":"rounded_corner","ttl":43200,"p":"101"},"eventParams":{"time":1675955336,"userId":50101467,"eventProperties":{"userId":"U50101467"}},"priority":"normal","ttl":43200}},"userInfo":{"name":"MojUse13","userId":"50101467","language":"English","tenant":"moj","deviceIdMap":{"41d3e0e4447b99af":{"token":"eTP6WCtzTOSBYwXvjK1Hme:APA91bEs4r2t2f8mMJN_PDA-48OuDXgbPR0zoe-aacpkG13dlKYxVPhUmvkHbjghvNXnTdSyBJIa-5oWHSO7EdR1XusDym3PiRpQNX54degUvDRixcDW_QAkdyO01pETWU_Ogk79VktO","appVersion":"600","clientType":"android","manufacturer":"","deviceId":"41d3e0e4447b99af"},"c751b3bdc7b1a610":{"token":"eshk__3gQhio8JCsISd5dt:APA91bE3eRPv-8XU1YbTvkS3Nw0EUu0AbzwBkYExDO6NVxIpXqeuxbKqM06xotvGQ9XIEEoH533YKqaA5dnc5-HJiZwRpTMZmGfb_5rdFaIljo4zvc0PHHB8QP2DgS3X4Y3E116Vknyv","appVersion":"540","clientType":"android","manufacturer":"Xiaomi","deviceId":"c751b3bdc7b1a610"}},"p13nVariant":"ds-v1"}}}
console.log(JSON.stringify(sort(obj)));
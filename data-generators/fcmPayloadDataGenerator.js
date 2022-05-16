const dataTemplate = JSON.stringify({
    "notifInfo": {
        "id": "df74d304-cb50-4306-b636-d640e8403fdc",
        "type": "WEBHOOK",
        "experimentEnabled": false,
        "actionType": "bucket_open"
    },
    "userInfo": {
        "id": "%uid%",
        "name": "Moj User",
        "deviceId": "android",
        "appVersion": 1110,
        "token": "c15i08LWMOk:APA91bGWpeJh1QXFqv9JlUyyhOJOPXI5l3Qamo7OxYrOktzvQbA0s4FnfHVUsl4nACW4kwI_4AbQVRQVGrw88suJs43Q2dfTmbB1o9kKGDll6eWnaYml0vtSXTUZWPpiyzuPg8QIEVCO",
        "clientType": "android",
        "source": "cache",
        "manufacturer": "samsung"
    }
});

const BtReader = require('../mau/readBTWithDbDriverV2');
const BtWriter = require('../mau/insertMauBTWithDbDriverV2');
const BtCleaner = require('../mau/deleteBTMauKeys');
const messages = 0;
const getData = async () => {

    /*********************************************/
    // DONT RUN THIS ON PRODUCTION, IF YOU DONT KNOW WHAT YOU'RE DOING
    /*********************************************/



    // create users in BT
    // const insertedUsers = (await new BtWriter().insertData(messages)).map(d => d.updateSpecification.userId);
    // const result = insertedUsers.map(user => {
    //     return dataTemplate.replace('%uid%', user.userId);
    // });
    // const delete users
    // await new BtCleaner().deleteUsers();
}
getData();
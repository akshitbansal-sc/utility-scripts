const _ = require('lodash');
const DeleteBTMauKeys = require('./deleteBTMauKeys');
const deleteBTMauKeys = new DeleteBTMauKeys();
// console.log = function() {}
const getRequiredPackages = () => {
    const readers = [
        require('./readBTWithDbDriverV1'),
        require('./readBTWithDbDriverV2'),
        require('./readMauWithBTClient')
    ];
    const writers = [
        require('./insertMauBTWithDbDriverV1'),
        require('./insertMauBTWithDbDriverV2'),
        require('./insertMauBTWithBTClient'),
    ];
    return [readers, writers];
}

const noOfRecords = 1;


const checkBody = (obj1, obj2) => {
    if (_.isEqual(obj1, obj2)) return true;
    console.log('not matching', obj1, obj2);
    return false;
}


async function verify() {
    const [readers, writers] = getRequiredPackages();
    for (let i = 0; i < writers.length; i++) {
        const writer = new writers[i]();
        console.error('writing with', writers[i].name);
        // console.log('created data' , 
        await writer.insertData(noOfRecords);
        // );
        console.error('written with', writers[i].name);
        let readData = [];
        for (let j = 0; j < readers.length; j++) {
            const reader = new readers[j]();
            const data = await reader.read();
            readData.push(data);
            console.error('read with', readers[j].name);
        }
        // console.error(readData);
        for (let k = 0; k < 3; k++) {
            readData[i] = readData[k].sort((r1, r2) => r1.userId - r2.userId);
        }
        
        // console.log('readData', readData);
        if (!checkBody(readData[0], readData[1]) ||
        !checkBody(readData[0], readData[2]) ||
        !checkBody(readData[2], readData[1])) {
            console.log('not matching');
            return;
        };
        console.error('records matching, now deleting');
        await deleteBTMauKeys.deleteUsers();
    }
}

verify();



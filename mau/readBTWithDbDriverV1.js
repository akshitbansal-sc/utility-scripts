const dbDriver = require('dbdriver');
const constants = require('../constants');


class ReadBTWithDbDriverV1 {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = constants.mau.mauTableName;
        this.shard = constants.mau.shard;
        this.language = constants.mau.mauLang;
    }

    async read() {
        try {
            const [err, items] = await new Promise((resolve, reject) => 
                this.dbDriver.scanTable(this.tableName, (err, data) => {
                    if (err){
                        return reject(err);
                    }
                    return resolve(data);
            })).invoke();
            if (items.length == 0) {
                console.log('no data');
                return;
            }
            const result = [];
            for (const row of items) {
                const user = this.parseUserFromBTRowData(row);
                result.push(user);
            }
            // console.log(result);
            return (result);
        } catch(e) {
            console.error(e.message);
        }
    }

    parseUserFromBTRowData(userInfo) {
        let user = {};
		if (!userInfo || !userInfo.userId) {
            return null;
        }
        user.userId = Number(userInfo.userId.N);
        user.expire = Number(userInfo?.expire?.N);
        user.language = this.language;
        user.state = userInfo.state ? userInfo.state.S : null;
		return user;
	}
}

// new ReadBTWithDbDriverV1().read();
module.exports = ReadBTWithDbDriverV1;
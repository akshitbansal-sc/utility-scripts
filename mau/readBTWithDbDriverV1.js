const dbDriver = require('dbdriver');
const constants = require('../constants');


class ReadBTWithDbDriverV1 {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = 'mauNotifications';
        this.primaryKey = constants.mau.mauPrimaryKey
		this.tableName = constants.mau.mauTableName;
		this.indexName = null;
		this.onlyCount = null;
		this.limit = 500;
		this.sortAscending = true;
		this.hashExp = '#language = ';
		this.hashVal = { S: this.primaryKey };
		this.rangeExp = null;
		this.rangeVal =null;
		this.expAttr = {
			'#language': 'language'
		};
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
            // console.log(Items);
            const result = [];
            for (const row of items) {
                const user = this.parseUserFromBTRowData(row);
                result.push(user);
            }
            return (result);
        } catch(e) {
            console.error(e.message);
        }
    }

    parseUserFromBTRowData(userInfo) {
        let user = {};
		if (!userInfo || !userInfo.userId) {
            // this.logger.error('UserInfo is undefined. Cannot send notification');
            // return resolve(null);
            return null;
        }
        user.userId = Number(userInfo.userId.N);
        user.expire = Number(userInfo?.expire?.N);
        user.language = constants.mau.mauLang;//userInfo.language ? userInfo.language.S : null;
        // user.gender = userInfo.gender ? userInfo.gender.S : null;
        // user.age = userInfo.ageRange ? userInfo.ageRange.S : null;
        // user.city = userInfo.city ? userInfo.city.S : null;
        user.state = userInfo.state ? userInfo.state.S : null;
		return user;
	}
}

module.exports = ReadBTWithDbDriverV1;
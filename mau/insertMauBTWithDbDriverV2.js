const DBDriverClientV2 = require("db-driver-v2-client").DBClientV2;
const dbDriverBase64Util =
  require("db-driver-v2-client").Base64EncodeDecodeUtil;
const crc32 = require("crc-32");
const { v4: uuidv4 } = require("uuid");
const constants = require("../constants");
const { getLanguageShardForUserId, getRowKeyForUserIdAndLanguageShard, getDoubleBEBase64, getDbDriver2FormattedData } = require("./utility");

class InsertMauBTWithDbDriverV2 {
  constructor() {
    const dbDriverConfiguration = {
        useSharedLibrary: true,
        serviceName: constants.project.serviceName,
        projectName: constants.project.id,
        environment: constants.project.env,
    };

    this.dbDriver = new DBDriverClientV2(dbDriverConfiguration);
    this.shard = constants.mau.shard;
    this.tableName = constants.mau.mauTableName;
  }

  async insertData(no) {
    const userIds = [];
    for (let i = 0; i < no; ++i) {
      userIds.push(Math.abs(crc32.str(uuidv4())));
    }
    const batches = no / 1000;
    let promises = [];
    for (let batch = 0; batch < batches; batch++) {
        const userIdsBatch = userIds.slice(batch * 1000, Math.min(no, (batch + 1) * 1000));
        promises.push(this.batchUpdate(userIdsBatch));
        if (promises.length === 10) {
            await Promise.all(promises);
            promises = [];
        }
    }
    if (promises.length) {
        await Promise.all(promises);
        promises = [];
    }
    console.log('done');
    // return res;
  }

  async batchUpdate(userIds) {
    const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const data = userIds.map((userId) => {
      return getDbDriver2FormattedData(this.shard, {
        userId,
        state: "Maharashtra",
        expire,
        tenant: 'moj'
      });
    });
    try {
      await this.dbDriver.batchUpdate(this.tableName, data);
      console.log("done inserted", data.length);
      return data;
    } catch (e) {
      console.error(e);
    }
  }

  async singleUpdate(userId, langShard, state) {
    const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const data = {
        userId: getDoubleBEBase64(userId),
        language: dbDriverBase64Util.encodeStringToBase64(langShard),
        state: dbDriverBase64Util.encodeStringToBase64(state),
        expire: getDoubleBEBase64(expire),
        tenant: dbDriverBase64Util.encodeStringToBase64('mojtt~')
    };
    const key = getRowKeyForUserIdAndLanguageShard(userId,
        langShard);
    try {
        await this.dbDriver.update(this.tableName, key, data);
        console.log('done');
        return data;
    } catch (e) {
        console.log(e.message);
    }
  }

}

// new InsertMauBTWithDbDriverV2().singleUpdate(50175, '0_Hindi', 'Gujrat');
// new InsertMauBTWithDbDriverV2().singleUpdate(50101467, '0_Hindi', 'Punjab');
// new InsertMauBTWithDbDriverV2().singleUpdate(50103383, '0_Hindi', 'Gujrat');
new InsertMauBTWithDbDriverV2().singleUpdate(50102802, getLanguageShardForUserId(50102802, 'Rajasthani'), 'Punjab');
module.exports = InsertMauBTWithDbDriverV2;

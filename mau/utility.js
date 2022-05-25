const constants = require("../constants");
const dbDriverBase64Util = require("db-driver-v2-client").Base64EncodeDecodeUtil;
const crc32 = require("crc-32");


function getRowKeyForUserAndLanguage(userId, language) {
  const langShard = getLanguageShardForUserId(userId, language);
  const paddedUserId = userId
    .toString()
    .padStart(
      constants.PADDED_USERID_TOTAL_LENGTH,
      constants.USERID_PADDING_FILL_STRING
    );
  return `${langShard}#${paddedUserId}`;
}

function getLanguageShardForUserId(userId, language) {
  const shard = Math.abs(crc32.str(userId.toString())) % 19;
  return `${shard}_${language}`;
}

function parseUserFromBTWithDbDriverV2(data) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  // console.log(data.key);
  const user = {};
  for (const [name, value] of Object.entries(data)) {
    //remove .data for readRowsWithKeys
    if (!value) {
      continue;
    }
    let parsedValue;
    switch (name) {
      case "expire":
      case "userId":
        // the integer will be read by double BE
        parsedValue = Buffer.from(value, "base64").readDoubleBE(0);
        break;
      case "key":
        parsedValue = value;
        break;
      default:
        // string will be read by decoding the string
        parsedValue = dbDriverBase64Util.decodeStringFromBase64(value);
    }
    user[name] = parsedValue;
  }
  return user;
}

async function parseUserFromBTWithBTClient(data) {
    const columnFamilies = Object.keys(data);
    if (!columnFamilies || !columnFamilies.length) {
        return null;
    }
    const colFamilyData = data[columnFamilies[0]];
    const user = {};
    for (const colQualifier of Object.keys(colFamilyData)) {
        let parsedValue;
        const value = colFamilyData[colQualifier][0].value;
        switch (colQualifier) {
            case 'expire':
            case 'userId':
                parsedValue = value.readDoubleBE(0);
                break;
            default:
                parsedValue = value.toString();
        }
        user[colQualifier] = parsedValue;
    }
    return user;
}

function getRowKeyForUserIdAndLanguageShard(userId, langShard) {
  const paddedUserId = userId.toString().padStart(19, "0");
  return [
    {
      name: "rowKey",
      value: `${langShard}#${paddedUserId}`,
    },
  ];
}

function getDoubleBEBase64(num) {
  let integerBuffer = Buffer.alloc(8);
  integerBuffer.writeDoubleBE(num);
  return integerBuffer.toString("base64");
}

function parseUserFromBTWithDbDriverV1(userInfo) {
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

function getDbDriver2FormattedData(langShard, data) {
    const formattedData = {};
    formattedData.key = getRowKeyForUserIdAndLanguageShard(
      data.userId,
      langShard
    );
    formattedData.updateSpecification = {};
    formattedData.updateSpecification.userId = getDoubleBEBase64(
      data.userId
    );
    formattedData.updateSpecification.language =
      dbDriverBase64Util.encodeStringToBase64(langShard);
    formattedData.updateSpecification.expire = getDoubleBEBase64(
      data.expire
    );
    if (data.tenant) {
        formattedData.updateSpecification.tenant = dbDriverBase64Util.encodeStringToBase64(data.tenant);
    }
    if (data.state) {
      formattedData.updateSpecification.state =
        dbDriverBase64Util.encodeStringToBase64(data.state);
    }
    return formattedData;
  }

module.exports = {
  parseUserFromBTWithDbDriverV2,
  getRowKeyForUserAndLanguage,
  getRowKeyForUserIdAndLanguageShard,
  getLanguageShardForUserId,
  getDoubleBEBase64,
  parseUserFromBTWithBTClient,
  parseUserFromBTWithDbDriverV1,
  getDbDriver2FormattedData
};

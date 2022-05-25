Promise.prototype.invoke = function() {
    return this.then(res => [res, null]).catch(err => [null, err]);
}

module.exports = {
    driver: {
        dbDriver: {
            url: 'http://db-driver.staging.sharechat.internal'
        }
    },
    mau: {
        mauLang: 'dbDriverPOC',
        shard: 'testShard',
        mauTableName: 'mauNotifications',
        db: 'sharechat-bt-test',
        projectId: "sharechat-migration-test",
        languages: [ "Malayalam", "Kannada", "Hindi", "Urdu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Bhojpuri", "Assamese", "Haryanvi", "Rajasthani", "Telugu", "Tamil", "Pidgin", "Bangladeshi",]
    },
    project: {
        env: 'STAGING',
        id: 'MOJ',
        serviceName: 'sc-update-mau-v2'
    }
}
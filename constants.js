Promise.prototype.invoke = function() {
    return this.then(res => [res, null]).catch(err => [null, err]);
}

module.exports = {
    driver: {
        dbDriver: {
            url: 'http://db-driver.staging.moj.internal'
        }
    },
    mau: {
        mauLang: 'Marathi',
        shard: '1_Urdu#',
        mauTableName: 'mauNotificationsV2',
        db: 'production-bt-3',
        projectId: "moj-prod",
        languages: [ "Malayalam", "Kannada", "Hindi", "Urdu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Bhojpuri", "Assamese", "Haryanvi", "Rajasthani", "Telugu", "Tamil", "Pidgin", "Bangladeshi", 'English']
    },
    project: {
        env: 'STAGING',
        id: 'MOJ',
        serviceName: 'sc-update-mau-v2',
        // name: 'moj-prod'
    }
}
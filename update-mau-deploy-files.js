const fs = require('fs');
const env = 'production'

// update urdu file, that will be copied in other files
const filePath = `/Users/akshitbansal/sharechat/repos/notification-service-jobs/cronJobs/infra/${env}/update-mau/deploy-urdu.yaml`;
const file = fs.readFileSync(filePath).toString();
const languages = [
    'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Bhojpuri', 'Assamese',
    'Malayalam', 'Kannada', 'Haryanvi', 'Rajasthani', 'Pidgin', 'Bangladeshi', 'English'
];

languages.map(lang => {
    const deploy = file.replace(/urdu/g, lang.toLowerCase()).replace(/Urdu/g, lang);
    // todo change this as per need
    fs.writeFileSync(`/Users/akshitbansal/sharechat/repos/notification-service-jobs/cronJobs/infra/${env}/update-mau/deploy-${lang.toLowerCase()}.yaml`, deploy);
});

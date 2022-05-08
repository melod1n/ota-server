import {writeFile} from 'fs/promises';

import child_process from 'child_process';

child_process.exec('start cmd /k ngrok http 8080', function (error, stdout, stderr) {
    if (error) {
        console.error(error);
    }
});

setTimeout(() => {
    fetch('http://127.0.0.1:4040/api/tunnels')
        .then(res => res.json())
        .then(json => json.tunnels.map(tunnel => tunnel.public_url))
        .then(async urls => {
            const url = urls[0];
            await writeFile('ngrok_url.json', JSON.stringify({url: url}));

            child_process.exec('commit_and_push_ngrok_url');
            console.log(url);
        })
        .catch(console.error);
}, 5000);
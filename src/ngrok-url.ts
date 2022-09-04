import {writeFile} from "fs/promises";

import child_process from "child_process";
import {getReleaseDownloadLink, port, setBaseUrl} from "./index";
import {ReleasesStorage} from "./database/storage/releases-storage";
import {appDatabase} from "./database/database";

const releasesStorage = new ReleasesStorage(appDatabase);

export class NgrokUrl {

	// noinspection JSUnusedGlobalSymbols
	static init() {
		child_process.exec(`start cmd /k ngrok http ${port}`, function (error) {
			if (error) {
				console.error(error);
			}
		});

		setTimeout(async () => {
			await this.getNgrokUrl();
		}, 5000);
	}

	static getNgrokUrl(): Promise<string> {
		return new Promise((resolve, reject) => {
			fetch("http://127.0.0.1:4040/api/tunnels")
				.then(res => res.json())
				.then(json => json.tunnels.map(tunnel => tunnel.public_url))
				.then(async urls => {
					const url = urls[0];
					await writeFile("ngrok_url.json", JSON.stringify({url: url}));

					setBaseUrl(url);

					const releases = await releasesStorage.getAll();

					for (let i = 0; i < releases.length; i++) {
						const release = releases[i];
						release.downloadLink = getReleaseDownloadLink(release.fileName);
					}

					await releasesStorage.updateAll(releases);

					child_process.exec("commit_and_push_ngrok_url");
					console.log(url);

					resolve(url);
				})
				.catch(error => {
					console.error(error);
					reject(error);
				});
		});
	}
}


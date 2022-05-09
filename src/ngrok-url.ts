import {writeFile} from "fs/promises";

import child_process from "child_process";
import {port, setBaseUrl} from "./index";

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


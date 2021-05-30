import axios from 'axios';
import { app } from '../main';

class AskMasterService {
    async askWorkerAddress(url: string, from: any, names: Array<string>) {
        let data = {
            from,
            asks: names
        };
        let headers = {
            'Content-Type': 'application/json; charset=utf-8'
        };
        return axios
            .post(url, data, { headers })
            .then(function (response) {
                let masterResponse = response.data;
                if (masterResponse.code == 1) {
                    let data = masterResponse.data;
                    names.forEach(function (name) {
                        app.setConfig(`workers.address.${name}`, data[name]);
                    });
                }
            })
            .catch(function (err) {
                console.error(new Date().toTimeString() + ' ask master failed');
            });
    }
}

export const askMasterService = new AskMasterService();

const axios = require('axios');
const HttpProxy = require('./index');

async function main() {
    let proxy = new HttpProxy('http');
    await proxy.init();
    let res = await proxy.protection(async () => {
        let ip = proxy.getIP();
        return await getBaidu(ip);
    });
    console.log(res);
}

async function getBaidu(ip) {
    return axios.get('http://baidu.com', {
        proxy: ip
    });
}

main();
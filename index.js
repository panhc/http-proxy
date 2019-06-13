
const axios = require('axios');
const request = require('request');
const cheerio = require('cheerio');

function sleep(time) {
    return new Promise(reslove => setTimeout(reslove, time));
};

class HttpProxy {
    constructor(protocol) {
        this.pool = []; // 代理池
        this.ips = [];
        this.proxyUrl = {
            http: 'http://www.xiladaili.com/http/',
            https: 'http://www.xiladaili.com/https/'
        }[protocol];
        this.validteUrl = {
            http: 'http://baidu.com',
            https: 'https://www.baidu.com/'
        }[protocol]
        this.protocol = protocol;
        this.used = null;  // 当前被使用的ip
    }

    async main() {
        console.log('代理抓取中-------------');
        await this.crawlProxy();
        // 验证代理
        let p = [];
        this.pool = [];
        for (let index = 0; index < this.ips.length; index++) {
            let ip = this.ips[index];
            p.push(this.validte(ip));
        }
        await Promise.all(p);
        console.log('代理抓取结束-------------');
    }

    async crawlProxy() {
        let page = Math.ceil(Math.random() * 1999) + 1;
        const { data } = await axios.get(this.proxyUrl + page);
        let $ = cheerio.load(data);
        let ips = [];

        $('.fl-table tr').each((index, item) => {
            if (index === 0) return;
            let tds = $(item).find('td');
            let ip = {};
            let text = tds.eq(0).text().split(':');
            ip.host = text[0];
            ip.port = text[1];
            ips.push(ip);
        });
        this.ips = ips;
    }

    async validte(ip) {
        return new Promise(reslove => {
            try {
                let _request = request.defaults({ proxy: `${this.protocol}://${ip.host}:${ip.port}` });
                _request.get(this.validteUrl, { timeout: 3000 }, (err, res) => {
                    if (!err) {
                        console.log(ip);
                        this.pool.push(ip);
                        // console.log(res);
                    }
                    reslove();
                });
            } catch (e) {
                reslove();
            }
        });
    }

    async getIP() {
        if (this.pool.length > 0) {
            console.log('代理池中剩余', this.pool.length);
            let random = Math.ceil(Math.random() * this.pool.length - 1);
            console.log('代理随机数', random);
            this.used = random;
            return this.pool[random];
        } else {
            await this.main();
            return await this.getIP();
        }
    }

    async protection(fn) {
        try {
            return await fn();
        } catch (error) {
            console.log('代理重试中');
            this.pool.splice(this.used, 1);
            await sleep(1000);
            return await this.protection(fn);
        }
    }
}

module.exports = HttpProxy;

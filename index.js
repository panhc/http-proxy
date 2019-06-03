
const axios = require('axios');
const cheerio = require('cheerio');

class HttpProxy {
    constructor(protocol) {
        this.pool = []; // 代理池
        this.ips = [];
        this.proxyUrl = {
            http: 'https://www.xicidaili.com/nn',
            https: 'https://www.xicidaili.com/wn'
        }[protocol];
        this.validteUrl = {
            http: 'http://baidu.com',
            https: 'https://www.baidu.com/'
        }[protocol]
        this.protocol = protocol;
    }

    async init() {
        console.log('代理抓取中');
        setTimeout(this.init, 5 * 60 * 1000);
        await this.crawlProxy();
        // 验证代理
        let p = [];
        for (let index = 0; index < this.ips.length; index++) {
            let ip = this.ips[index];
            p.push(this.validte(ip));
        }
        await Promise.all(p);
        console.log('代理抓取结束');
    }

    async crawlProxy() {
        const { data } = await axios.get(this.proxyUrl);
        let $ = cheerio.load(data);
        let ips = [];
        $('#ip_list tr').each((index, item) => {
            if (index === 0) return;
            let tds = $(item).find('td');
            let ip = {};
            ip.host = tds.eq(1).text();
            ip.port = tds.eq(2).text();
            ips.push(ip);
        });
        this.ips = ips;
    }

    async validte(ip) {
        try {
            await axios.get(this.validteUrl, {
                timeout: 500,
                proxy: {
                    host: ip.host,
                    port: ip.port,
                },
            })
            console.log(ip);
            this.pool.push(ip);
        } catch (e) {

        }
    }

    getIP() {
        if (this.pool.length > 0) {
            let random = Math.ceil(Math.random() * this.pool.length - 1);
            console.log('代理随机数', random);
            return this.pool[random];
        } else {
            return null;
        }
    }

    async protection(fn) {
        try {
            return await fn();
        } catch (error) {
            console.log('代理重试中');
            return await protection(fn);
        }
    }
}

module.exports = HttpProxy;

require('dotenv').config();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async() => {
    try{
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto('https://cafe.naver.com/steamindiegame');
        await page.click("#menuLink331");
        
        //iframe이여도 selector 가능하게 하기
        const elementHandle = await page.waitForSelector('#cafe_main');
        const frame = await elementHandle.contentFrame();
        await frame.waitForSelector('#main-area > div:nth-child(6) > table > tbody > tr:nth-child(1) > td.td_article > div.board-list > div > a.article');
        await frame.click('#main-area > div:nth-child(6) > table > tbody > tr:nth-child(1) > td.td_article > div.board-list > div > a.article');

        const hotclipHandle = await page.waitForSelector('#cafe_main');
        const clipframe = await hotclipHandle.contentFrame();
        await clipframe.waitForSelector('#app > div > div > div.ArticleContentBox > div.article_header > div.ArticleTitle > div');
        const link = await clipframe.$$('#app > div > div > div.ArticleContentBox > div.article_container > div.article_viewer > div > div.content.CafeViewer > div > div > div > div > div > div > p > span > a');
        const title = await clipframe.$$('#app > div > div > div.ArticleContentBox > div.article_header > div.ArticleTitle > div > .title_text');

        const titlename = await Promise.all(title.map((element) => {
            return element.evaluate((domElement) => {
                return domElement.textContent;
            })
        }));

        const cilplink = await Promise.all(link.map((element) => {
            return element.evaluate((domElement) => {
                return domElement.getAttribute("href");
            })
        }));

        console.log(cilplink[0]);


    } catch (e){
        console.log(e);
    }
})();


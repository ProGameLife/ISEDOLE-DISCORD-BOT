const { Client, Intents, MessageEmbed, Message, MessageAttachment } = require('discord.js');
require('dotenv').config();
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: "https://98d0b718d98b4f08b74bb62894d03eb0@o1152022.ingest.sentry.io/6229755",
    tracesSampleRate: 1.0,
  });
  
  const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
  });
  


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS, Intents.FLAGS.GUILD_MESSAGE_TYPING] }); // intents를 해줘야지 type오류가 안난다 discord.js client에서 오류남;;

client.on('ready', async () => {
    console.log('이세돌 봇 on'); 

    let linkchek;
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    
    cron.schedule('*/1 * * * *', async () => {
        try{
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.goto('https://cafe.naver.com/steamindiegame');
            await page.click("#menuLink331");
            
            //iframe이여도 selector 가능하게 하기
            const elementHandle = await page.waitForSelector('#cafe_main');
            const frame = await elementHandle.contentFrame();
            await frame.waitForSelector('#main-area > div:nth-child(6) > table > tbody > tr:nth-child(1) > td.td_article > div.board-list > div > a.article');
            const url = await frame.$$('#main-area > div:nth-child(6) > table > tbody > tr:nth-child(1) > td.td_article > div.board-list > div > a.article');
            
            const geturl = await Promise.all(url.map((element) => {
                return element.evaluate((domElement) => {
                    return domElement.getAttribute("href");
                })
            }))

            await frame.click('#main-area > div:nth-child(6) > table > tbody > tr:nth-child(1) > td.td_article > div.board-list > div > a.article');
            const hotclipHandle = await page.waitForSelector('#cafe_main');
            const clipframe = await hotclipHandle.contentFrame();
            await clipframe.waitForSelector('#app > div > div > div.ArticleContentBox > div.article_header > div.ArticleTitle > div', {timeout : 50000});
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
            
            if(linkchek != cilplink[0]){
                const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('🎬 이세돌 | 핫클립')
                .setURL('https://cafe.naver.com/steamindiegame/#menuLink331')
                .setAuthor({ name: '이세돌사랑해', iconURL: 'https://yt3.ggpht.com/5vwZ3NZL6Zv4C7cl5sshsTk-XycH7r-4zo6nQR7g9Z7SLrMzeabWWzn5M1V3SqJXjTxLj_hb=s88-c-k-c0x00ffffff-no-rj', url: 'https://cafe.naver.com/steamindiegame/#menuLink331' })
                .setDescription('이세돌 많은 사랑 부탁드립니다!')
                .setThumbnail('https://w.namu.la/s/e65c5665ec17d3de4f8afe1681e270aec2f2d0c477083d049a11857f523dec07f65c0d619c288f6018fc717a3b1983ee280a1966c08f3717e8d19cd6c9764f4c07376f1dcc0002de24abf7d4cc12495a946d225b169f55d62a32da31c11a1bb820d1a409534d64a7169a6d849ed9450a')
                .addFields(
                    { name: '제목', value: titlename[0] },
                    { name: '카페 글링크', value: process.env.MAINLINK + geturl[0], inline: true },
                )
                .setImage('https://w.namu.la/s/f99dbf4ce7f02fc9b75572f63ea0352d1548ae7e7b04a95fe0541f2d8462be10c0cea4aedc206705b9b52b411436aa3afd08e102f59f8683cfa5a59626b2baa0e811169ac0c7ed772fc4e9a6aa95b5a09ae09e56b0aac2f076cf67e936ab0af9')
                .setTimestamp()
                .setFooter({ text: '⬇️⬇️⬇️⬇️⬇️⬇️⬇️영상 맛보기⬇️⬇️⬇️⬇️⬇️⬇️⬇️'});
                
                channel.send({ embeds: [embed] });
                linkchek = cilplink[0];
                if(cilplink[0] && cilplink[0].startsWith(process.env.STARTLINK)){
                channel.send(cilplink[0]);
                }
            }
            await page.close();
            await browser.close();
        } catch (e){
            console.log(e);
            Sentry.captureException(e);
        } finally {
            transaction.finish();
        }
    });
});

client.login(process.env.BOT_TOKEN);

//[Symbol(kError)]: Error: socket hang up NODE JS



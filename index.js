const puppeteer = require('puppeteer-core');
const fs = require('fs');
const cheerio = require('cheerio');

console.log('Starting...');


async function SearchResult() {
    const videoSearch = 'javascript';
    const results = [];
    const stream = fs.createWriteStream('scrapped.txt', { flags: 'a' });


    try {
        console.log('0 - Launching Chrome...');

        const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
        console.log('1 - Chrome started, attempting to Open a new page...');

        const page = await browser.newPage();
        console.log('2 - The new page is all set and is now redirecting to youtube...');

        await page.goto('https://www.youtube.com', { waitUntil: 'load' });
        console.log(`4 - Page loaded, searching for [${videoSearch}] videos...`);

        const input = await page.$(`input[id="search"]`);
        await input.focus();
        await input.type(videoSearch);
        await input.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.waitForFunction(`document.title.indexOf('${videoSearch}') !== -1`, { timeout: 5000 });

        console.log('5 - Videos found and network is stable, printing your screen...');

        let html = await page.content();

        const $ = cheerio.load(html);

        $('#contents ytd-video-renderer,#contents ytd-grid-video-renderer').each((i, link) => {
            results.push({
                title: $(link).find('#video-title').text().trim(),
                link: $(link).find('#video-title').attr('href').trim(),
                snippet: $(link).find('#description-text').text().trim().replace('\n', ''),
                channel: $(link).find('#channel-name a').text().slice(0, (($(link).find('#channel-name a').text().length) / 2)),
                channel_link: $(link).find('#channel-name a').attr('href'),
                views: $(link).find('#metadata-line span:nth-child(1)').text(),
                posted_at: $(link).find('#metadata-line span:nth-child(2)').text()
            });
            stream.write(`title: ${results[i].title}
link: https://www.youtube.com${results[i].link}
snippet: ${results[i].snippet}
channel: ${results[i].channel}
channel_link: https://www.youtube.com${results[i].channel_link}
views: ${results[i].views}
posted_at: ${results[i].posted_at}
__________________________________________\n\n`);

        })

        stream.close();

        await page.screenshot({ path: 'scrapped_page.png' });
        console.log('6 - Screenshot saved for data reference');

        await browser.close();
        console.log('7 - Done! <3');

    }
    catch (err) {
        console.log('Please check at which step the error occurred and try again later.');
        process.exit(22);
    }



}

SearchResult();
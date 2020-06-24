require('lodash');
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const delay = require('delay');

// open page in browser
let browser = {}, page = {};

before (async function () {

    const opts = {
        // show chrome window
        headless: false,
        // do not run too fast
        slowMo: 10,
        // 30sec max wait for response
        timeout: 30000
    };

    browser = await puppeteer.launch(opts);

    page = await browser.newPage();
    await page.goto('http://localhost:8080');
});


// close all
after (async function () {
    //await page.close();
    //browser.close();
});


// tests
describe( 'Basic functionality', function() {

    it('01. Server OK', async function () {
        expect(await page.title()).to.eql('ScienceDb-SPA');
    });

    // it('02. Login', async function () {

    //     await page.type('form.login > input[type="email"]', 'admin@scidb.org', {delay: 20});
    //     await page.type('form.login > input[type="password"]', '123', {delay: 20});

    //     await Promise.all([
    //         page.click('button[type="submit"]'),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await delay(500);

    //     expect(await page.title()).to.eql('ScienceDb-SPA');

    // });


    // it('03. Individual table is empty', async function () {

    //     const SELECTOR = 'a[href="/individuals"]';
    //     await page.waitFor(SELECTOR);

    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await delay(500);

    //     expect(await page.$('td.vuetable-empty-result') !== null).to.eql(true);

    // });


    // it('04. Add individual', async function () {

    //     const SELECTOR = 'a[href="/individual"] > button';
    //     await page.waitFor(SELECTOR);

    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await delay(500);

    //     await page.type('#individual-name-div > input', 'First Individual');
    //     await page.type('#individual-transcript_counts-div > div > div > div > input', '5');
    //     await page.click('button[type="submit"]');
    //     await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    //     await delay(500);

    //     expect(await page.$('td.right.aligned') !== null).to.eql(true);

    // });


    // it('05. Update individual', async function () {

    //     let SELECTOR = 'div.custom-actions > a > button';
    //     await page.waitFor(SELECTOR);

    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);
    //     await delay(500);

    //     SELECTOR = '#individual-name-div > input';
    //     await page.click(SELECTOR, {clickCount: 3});
    //     await page.type(SELECTOR, 'First Updated', {delay: 20});

    //     await Promise.all([
    //         page.click('button[type="submit"]'),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);
    //     await delay(500);

    //     const cell = await page.$('tbody > tr > td:nth-child(0n+2)');
    //     const text = await page.evaluate(cell => cell.textContent, cell);

    //     expect(text).to.eql('First Updated');

    // });

    // it('06. Add one more and find both', async function () {

    //     const SELECTOR = 'a[href="/individual"] > button';
    //     await page.waitFor(SELECTOR);

    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await delay(500);

    //     await page.type('#individual-name-div > input', 'First Individual');
    //     await page.type('#individual-transcript_counts-div > div > div > div > input', '5');


    //     await Promise.all([
    //         page.click('button[type="submit"]'),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);
    //     await delay(500);

    //     await page.type('input', 'First');
    //     await page.click('div.inline.field > button');
    //     await delay(500);

    //     console.log("check array");

    //     let rows = await page.$$eval('tbody > tr', row => row);
    //     expect(rows.length).to.eql(2);
    // });

    // it('07. Delete all', async function () {

    //     let rows = await page.$$eval('tbody > tr', row => row);

    //     for(let i = 0; i < rows.length; i = i+1){
    //         await page.click('div.custom-actions > button:nth-child(0n+3)');
    //     }

    //     rows = await page.$$eval('tbody > tr', row => row);

    //     expect(rows.length).to.eql(1);
    // });

    // it('08. Check Cas_number works', async function () {

    //     let SELECTOR = 'a[href="/cas_numbers"]';
    //     await page.waitFor(SELECTOR);
    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await delay(500);

    //     SELECTOR = 'a[href="/cas_number"] > button';
    //     await page.waitFor(SELECTOR);
    //     await Promise.all([
    //         page.click(SELECTOR),
    //         page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    //     ]);

    //     await page.type('#cas_number-CAS_number-div > input', 'AAAAAA');
    //     await page.type('#cas_number-Cas_number-div > input', 'BBBBBB');
    //     await page.click('button[type="submit"]');

    //     await delay(500);
    //     expect(await page.$('td.right.aligned') !== null).to.eql(true);

    //     const cells = await page.$$('td');
    //     let cnt = 0;
    //     for (const cell of cells) {
    //         const inner = await page.evaluate(el => el.innerText, cell);
    //         if(inner === 'AAAAAA' || inner === 'BBBBBB') cnt++;
    //     }

    //     expect(cnt >= 2).to.eql(true);
    // });

});

//hint: document.querySelector() to find correct selector

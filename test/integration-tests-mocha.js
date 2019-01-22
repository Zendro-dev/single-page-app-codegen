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
        // 10sec max wait for response
        timeout: 10000
    };

    browser = await puppeteer.launch(opts);

    page = await browser.newPage();
    await page.goto('http://localhost:8080');
});


// close all
after (async function () {
    await page.close();
    browser.close();
});



// tests
describe( 'Basic functionality', function() {

    it('01. Server OK', async function () {
        expect(await page.title()).to.eql('Reconstruct DB');
    });


    it('02. Login Auth0', async function () {

        const SELECTOR = 'button.btn-info.log';
        await page.waitFor(SELECTOR);

        let sel = await page.$eval(SELECTOR, sel => sel.innerText);
        expect(sel).to.eql('Log In');


        await Promise.all([
            page.click(SELECTOR),
            page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        ]);

        await delay(2500);

        await page.type('input[name="email"]', 'example.tester@mydomain.org', {delay: 20});
        await page.type('input[name="password"]', 'QAZxsw12');

        await Promise.all([
            page.click('button[name="submit"]'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        ]);

        await delay(500);

        expect(await page.title()).to.eql('Reconstruct DB');

    });
});

//hint: document.querySelector() to find correct selector

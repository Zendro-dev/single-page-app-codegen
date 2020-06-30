require('lodash');
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const delay = require('delay');

// open page in browser
let browser = {}, page = {};
//test timeouts
const tt = 10000;
const ttmax = 20000;

before(async function () {
  this.timeout(ttmax);

  const opts = {
    // show chrome window
    headless: false,
    // do not run too fast
    slowMo: 10,
    // 30sec max wait for response
    timeout: 30000,
    // max resolution
    defaultViewport: null
  };

  browser = await puppeteer.launch(opts);

  page = await browser.newPage();
  await page.goto('http://localhost:8080');

});

// close all
after(async function () {
  await page.close();
  browser.close();
});

// tests
describe('Basic functionality', function () {
  //general timeout for each test
  this.timeout(tt);

  it('01. Server OK', async function () {
    await delay(500);

    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Vocen');
  });

  it('02. Login', async function () {
    //add data
    await page.click("input[id=LoginPage-textField-email]");
    await page.type("input[id=LoginPage-textField-email]", 'admin@vocen.on');
    //add data
    await page.click("input[id=LoginPage-textField-password]");
    await page.type("input[id=LoginPage-textField-password]", 'admin');
    
    await Promise.all([
      //wait for events
      page.waitForNavigation({ waitUntil: 'load' }),
      browser.waitForTarget(target => target.url() === 'http://localhost:8080/main/home'),
      
      //click
      page.click("button[id=LoginPage-button-login]"),
    ]);
    
    await delay(500);

    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Vocen');
  });

  it('03. Individual table is empty', async function () {

    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForNavigation({ waitUntil: 'load' }),
      browser.waitForTarget(target => target.url() === 'http://localhost:8080/main/model/individual'),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      page.waitForSelector('table[id=IndividualEnhancedTable-tableBody]', { hidden: true }),
      page.waitForSelector('div[id=IndividualEnhancedTable-box-noData]', { visible: true }),

      //click
      page.click("div[id=MainPanel-listItem-button-individual]"),
    ]);
    await delay(500);

    /**
     * Evaluate
     */
    let data = await apiResponse;    

    expect(await data.countIndividuals === 0).to.eql(true);
    expect(await page.title()).to.eql('Vocen');
  });


  it('04. Add individual', async function () {

    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTableToolbar-button-add]"),
    ]);

    //add data
    await page.click("textarea[id=StringField-Individual-name]");
    await page.type("textarea[id=StringField-Individual-name]", 'individual-1');

    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { hidden: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualCreatePanel-fabButton-save]"),
    ]);
    await delay(500);


    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(await data.addIndividual.name === 'individual-1').to.eql(true);
    expect(await page.title()).to.eql('Vocen');
  });


  it('05. Update individual', async function () {

    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTable-row-iconButton-edit-1]"),
    ]);

    //add data
    await page.click("textarea[id=StringField-Individual-name]", {clickCount: 3});
    await page.type("textarea[id=StringField-Individual-name]", 'individual-1-edited');

    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { hidden: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualUpdatePanel-fabButton-save]"),
    ]);
    await delay(500);


    /**
     * Evaluate
     */
    let data = await apiResponse;
    let cell = await page.$('tbody > tr > td:nth-child(0n+5)');
    let text = await page.evaluate(cell => cell.textContent, cell);

    expect(text).to.eql('individual-1-edited');
    expect(await data.updateIndividual.name === 'individual-1-edited').to.eql(true);
    expect(await page.title()).to.eql('Vocen');
  });

  it('06. Add one more and find both', async function () {
    
    /**
     * Add record
     */
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTableToolbar-button-add]"),
    ]);

    //add data
    await page.click("textarea[id=StringField-Individual-name]");
    await page.type("textarea[id=StringField-Individual-name]", 'individual-2');

    let apiResponse1 = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { hidden: true }),
      apiResponse1 = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualCreatePanel-fabButton-save]"),
    ]);
    await delay(500);

    /**
     * Search
     */
    //add input
    await page.click("input[id=IndividualEnhancedTableToolbar-textField-search]");
    await page.type("input[id=IndividualEnhancedTableToolbar-textField-search]", 'individual-');

    let apiResponse2 = null;
    let selCell1 = null;
    let selCell2 = null;
    await Promise.all([
      //wait for events
      selCell1 = page.waitForSelector('tr[id=IndividualEnhancedTable-row-1] > td:nth-child(0n+5)', { visible: true }),
      selCell2 = page.waitForSelector('tr[id=IndividualEnhancedTable-row-2] > td:nth-child(0n+5)', { visible: true }),
      apiResponse2 = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualEnhancedTableToolbar-iconButton-search]"),
    ]);
    await delay(500);


    /**
     * Evaluate
     */
    let data1 = await apiResponse1;
    let data2 = await apiResponse2;
    let cell1 = await selCell1;
    let cell2 = await selCell2;
    let text1 = await page.evaluate(cell => cell.textContent, cell1);
    let text2 = await page.evaluate(cell => cell.textContent, cell2);
    let rowsCount = await page.$$eval('tbody > tr', rows => rows.length);

    expect(await data1.addIndividual.name === 'individual-2').to.eql(true);
    expect(await data2.countIndividuals === 2).to.eql(true);
    expect(rowsCount).to.eql(2);
    expect(text1).to.eql('individual-1-edited');
    expect(text2).to.eql('individual-2');
    expect(await page.title()).to.eql('Vocen');

  });

  it('07. Delete all', async function () {

      let rowsCount = await page.$$eval('tbody > tr', rows => rows.length);
      for(let i = 0; i < rowsCount; i = i+1){
        //last events
        let lastEvents = [];
        if(i+1 === rowsCount) {
          lastEvents = [
            page.waitForSelector('table[id=IndividualEnhancedTable-tableBody]', { hidden: true }),
            page.waitForSelector('div[id=IndividualEnhancedTable-box-noData]', { visible: true }),
          ];
        }

        await Promise.all([
          //wait for events
          page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),
    
          //click
          page.click(`button[id=IndividualEnhancedTable-row-iconButton-delete-${i+1}]`),
        ]);
        await delay(500);

        let apiResponse = null;
        await Promise.all(lastEvents.concat([
          //wait for events
          page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { hidden: true }),
          apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
    
          //click
          page.click('button[id=IndividualDeleteConfirmationDialog-button-accept]'),
        ]));
        await delay(1000);


        /**
         * Evaluate
         */
        let data = await apiResponse;

        expect(await data.deleteIndividual === 'Item successfully deleted').to.eql(true);
      }

      /**
       * Evaluate
       */
      rowsCount = await page.$$eval('tbody > tr', rows => rows.length);

      expect(rowsCount).to.eql(0);
      expect(await page.title()).to.eql('Vocen');
  });

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

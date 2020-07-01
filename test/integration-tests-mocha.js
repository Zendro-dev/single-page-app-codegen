require('lodash');
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const delay = require('delay');

// open page in browser
let browser = {}, page = {};
//test timeouts
const tt = 10000;
const ttmax = 20000;

//number of records to add
const recordsCount_d2_it02 = 3;

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

/**
 * Part 1: Basic functionality
 */
describe('1. Basic functionality', function () {
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

  it('03. <individual> table is empty', async function () {

    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForNavigation({ waitUntil: 'load' }),
      browser.waitForTarget(target => target.url() === 'http://localhost:8080/main/model/individual'),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { hidden: true }),
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

  it('04. Add <individual>', async function () {

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

  it('05. Update <individual>', async function () {

    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTable-row-iconButton-edit-1]"),
    ]);
    await delay(1000);

    //add data
    await page.click("textarea[id=StringField-Individual-name]", { clickCount: 3 });
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
    for (let i = 0; i < rowsCount; i = i + 1) {
      //last events
      let lastEvents = [];
      if (i + 1 === rowsCount) {
        lastEvents = [
          page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { hidden: true }),
          page.waitForSelector('div[id=IndividualEnhancedTable-box-noData]', { visible: true }),
        ];
      }

      await Promise.all([
        //wait for events
        page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

        //click
        page.click(`button[id=IndividualEnhancedTable-row-iconButton-delete-${i + 1}]`),
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
});

/**
 * Part 2: Associations
 * 
 * <one_to_many>
 *   2. Add associations in create-panel.
 *    
 */

/**
 * <one_to_many>
 * 2. Add associations in create-panel.
 */
describe('2. Associations - one_to_many - Add associations in the create-panel.', function () {
  //general timeout for each test
  this.timeout(tt); //10s.

  it('01. <transcript_count> table is empty', async function () {

    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForNavigation({ waitUntil: 'load' }),
      browser.waitForTarget(target => target.url() === 'http://localhost:8080/main/model/transcript_count'),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      page.waitForSelector('tbody[id=TranscriptCountEnhancedTable-tableBody]', { hidden: true }),
      page.waitForSelector('div[id=TranscriptCountEnhancedTable-box-noData]', { visible: true }),

      //click
      page.click("div[id=MainPanel-listItem-button-transcript_count]"),
    ]);
    await delay(500);

    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(data.countTranscript_counts === 0).to.eql(true);
    expect(await page.title()).to.eql('Vocen');
  });

  it(`02. Add ${recordsCount_d2_it02} <transcript_count> records `, async function () {

    let responses = [];

    for(let i=1; i<=recordsCount_d2_it02; i++) {
      let input = {
        gene: `gene-${i}`,
        variable: `variable-${i}`,
        count: `${i}`,
        tissue_or_condition: `tissue_or_condition-${i}`,
      }
      // last events
      let lastEvents = [];
      if(i === recordsCount_d2_it02) {
        lastEvents = [
          page.waitForSelector('tbody[id=TranscriptCountEnhancedTable-tableBody]', { visible: true }),
          page.waitForSelector('div[id=TranscriptCountEnhancedTable-box-noData]', { hidden: true }),
        ];
      }

      await Promise.all([
        //wait for events
        page.waitForSelector('div[id=TranscriptCountAttributesFormView-div-root]', { visible: true }),
  
        //click
        page.click("button[id=TranscriptCountEnhancedTableToolbar-button-add]"),
      ]);
  
      //add input
      await page.click("textarea[id=StringField-TranscriptCount-gene]");
      await page.type("textarea[id=StringField-TranscriptCount-gene]", input.gene);
      await page.click("textarea[id=StringField-TranscriptCount-variable]");
      await page.type("textarea[id=StringField-TranscriptCount-variable]", input.variable);
      await page.click("input[id=FloatField-TranscriptCount-count]");
      await page.type("input[id=FloatField-TranscriptCount-count]", input.count);
      await page.click("textarea[id=StringField-TranscriptCount-tissue_or_condition]");
      await page.type("textarea[id=StringField-TranscriptCount-tissue_or_condition]", input.tissue_or_condition);
  
      let apiResponse = null;
      await Promise.all(lastEvents.concat([
        //wait for events
        page.waitForSelector('div[id=TranscriptCountAttributesFormView-div-root]', { hidden: true }),
        apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

        //click
        page.click("button[id=TranscriptCountCreatePanel-fabButton-save]"),
      ]));

      responses.push(apiResponse);
      await delay(500);
    }

    /**
     * Evaluate
     */
    for(let i=0; i<recordsCount_d2_it02; i++) {
      let data = await responses[i];
      expect(await data.addTranscript_count.gene === `gene-${i+1}`).to.eql(true);
    }
    expect(await page.title()).to.eql('Vocen');
  }).timeout(30000); //30s.

  it('03. Create <individual> record with <transcript_count> associations.', async function () {

    //go to: <individual> table
    let apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForNavigation({ waitUntil: 'load' }),
      browser.waitForTarget(target => target.url() === 'http://localhost:8080/main/model/individual'),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { hidden: true }),
      page.waitForSelector('div[id=IndividualEnhancedTable-box-noData]', { visible: true }),

      //click
      page.click("div[id=MainPanel-listItem-button-individual]"),
    ]);
    await delay(500);

    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(await data.countIndividuals).to.eql(0);
    expect(await page.title()).to.eql('Vocen');

    //click on: add <individual>
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTableToolbar-button-add]"),
    ]);

    //add input
    await page.click("textarea[id=StringField-Individual-name]");
    await page.type("textarea[id=StringField-Individual-name]", 'individual-1');

    //click on: associations tab
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=TranscriptCountsTransferLists-div-root]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      await page.click("button[id=IndividualCreatePanel-tabsA-button-associations]"),
    ]);
    await delay(500);

    /**
     * Evaluate
     */
    data = await apiResponse;
    let rowsCount = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);

    expect(data.countTranscript_counts).to.eql(recordsCount_d2_it02);
    expect(rowsCount).to.eql(recordsCount_d2_it02);
    expect(await page.title()).to.eql('Vocen');

    /*
     * add associations
     */
    //click on: add item 1
    let apiResponses = [];
    let expectedResponses = 4;
    await Promise.all([
      //wait for events
      page.waitForResponse((res) => {
        if(res.url()==='http://localhost:3000/graphql'){
          apiResponses.push(res.json().then((data) => data.data));
        }
        return(apiResponses.length === expectedResponses);
      }),
      //click
      page.click("button[id=TranscriptCountsToAddTransferView-listA-listItem-1-button-add]"),
    ]);
    await delay(500);
    /**
     * Evaluate
     */
    let datas = await Promise.all(apiResponses);
    let rowsCountA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    let rowsCountB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);

    expect(datas).to.include.deep.members([
      { countTranscript_counts: recordsCount_d2_it02-1 },
      { countTranscript_counts: 1 }]);
    expect(rowsCountA).to.eql(recordsCount_d2_it02-1);
    expect(rowsCountB).to.eql(1);
    expect(await page.title()).to.eql('Vocen');

    //click on: add item 2
    apiResponses = [];
    expectedResponses = 4;
    await Promise.all([
      //wait for events
      page.waitForResponse((res) => {
        if(res.url()==='http://localhost:3000/graphql'){
          apiResponses.push(res.json().then((data) => data.data));
        }
        return(apiResponses.length === expectedResponses);
      }),
      //click
      page.click("button[id=TranscriptCountsToAddTransferView-listA-listItem-2-button-add]"),
    ]);
    await delay(500);
    /**
     * Evaluate
     */
    datas = await Promise.all(apiResponses);
    rowsCountA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCountB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);

    expect(datas).to.include.deep.members([
      { countTranscript_counts: recordsCount_d2_it02-2 },
      { countTranscript_counts: 2 }]);
    expect(rowsCountA).to.eql(recordsCount_d2_it02-2);
    expect(rowsCountB).to.eql(2);

    //click on: add item 3
    apiResponses = [];
    expectedResponses = 4;
    await Promise.all([
      //wait for events
      page.waitForResponse((res) => {
        if(res.url()==='http://localhost:3000/graphql'){
          apiResponses.push(res.json().then((data) => data.data));
        }
        return(apiResponses.length === expectedResponses);
      }),
      //click
      page.click("button[id=TranscriptCountsToAddTransferView-listA-listItem-3-button-add]"),
    ]);
    await delay(500);
    /**
     * Evaluate
     */
    datas = await Promise.all(apiResponses);
    rowsCountA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCountB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);

    expect(datas).to.include.deep.members([
      { countTranscript_counts: recordsCount_d2_it02-3 },
      { countTranscript_counts: 3 }]);
    expect(rowsCountA).to.eql(recordsCount_d2_it02-3);
    expect(rowsCountB).to.eql(3);

    //click on: remove item 2
    apiResponses = [];
    expectedResponses = 4;
    await Promise.all([
      //wait for events
      page.waitForResponse((res) => {
        if(res.url()==='http://localhost:3000/graphql'){
          apiResponses.push(res.json().then((data) => data.data));
        }
        return(apiResponses.length === expectedResponses);
      }),
      //click
      page.click("button[id=TranscriptCountsToAddTransferView-listB-listItem-2-button-remove]"),
    ]);
    await delay(500);
    /**
     * Evaluate
     */
    datas = await Promise.all(apiResponses);
    rowsCountA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCountB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);

    expect(datas).to.include.deep.members([
      { countTranscript_counts: recordsCount_d2_it02-2 },
      { countTranscript_counts: 2 }]);
    expect(rowsCountA).to.eql(recordsCount_d2_it02-2);
    expect(rowsCountB).to.eql(2);

    //click on: save record
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=TranscriptCountAttributesFormView-div-root]', { hidden: true }),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualCreatePanel-fabButton-save]"),
    ]);
    await delay(1000);
    /**
     * Evaluate
     */
    data = await apiResponse;
    let cell = await page.$('tr[id=IndividualEnhancedTable-row-3] > td:nth-child(0n+5)');
    let text = await page.evaluate(cell => cell.textContent, cell);

    expect(text).to.eql('individual-1');
    expect(await data.addIndividual.name === 'individual-1').to.eql(true);
    expect(await page.title()).to.eql('Vocen');

    //click on: record detail view
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAssociationsPage-div-root]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

      //click
      page.click("button[id=IndividualEnhancedTable-row-iconButton-detail-3]"),
    ]);
    await delay(500);

    /**
     * Evaluate
     */
    data = await apiResponse;
    rowsCountA = await page.$$eval('div[id=TranscriptCountsCompactView-list-listA] > div[role=listitem]', rows => rows.length);

    expect(data.readOneIndividual.countFilteredTranscript_counts).to.eql(2);
    expect(rowsCountA).to.eql(2);
    expect(await page.title()).to.eql('Vocen');

    //click on: close detail panel
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAssociationsPage-div-root]', { hidden: true }),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { visible: true }),
      
      //click
      page.click("button[id=IndividualDetailPanel-button-close]"),
    ]);
    await delay(500);
    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Vocen');
  }).timeout(30000); //30s.
});

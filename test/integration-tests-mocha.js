require('lodash');
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const delay = require('delay');
const { extendWith } = require('lodash');

// open page in browser
let browser = {}, page = {};
//test timeouts
const tt = 10000;
const ttmax = 20000;
//delays
const ttdelay = 500;
//test specific settings
const recordsCount_d2_it02 = 5;
let individual_d2_it03 = null;

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
  //await page.close();
  //browser.close();
});

/**
 * Part 1: Basic functionality
 */
describe('1. Basic functionality', function () {
  //general timeout for each test
  this.timeout(tt);

  it('01. Server OK', async function () {
    await delay(ttdelay);

    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Zendro');
  });

  it('02. Login', async function () {
    //add data
    await page.click("input[id=LoginPage-textField-email]");
    await page.type("input[id=LoginPage-textField-email]", 'admin@zen.dro');
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
    await delay(ttdelay);

    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Zendro');
  });

  if(false)
  {
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
    await delay(ttdelay);

    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(await data.countIndividuals === 0).to.eql(true);
    expect(await page.title()).to.eql('Zendro');
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
    await delay(ttdelay);

    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(await data.addIndividual.name === 'individual-1').to.eql(true);
    expect(await page.title()).to.eql('Zendro');
  });

  it('05. Update <individual>', async function () {

    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),

      //click
      page.click("button[id=IndividualEnhancedTable-row-iconButton-edit-1]"),
    ]);
    await delay(ttdelay*2);

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
    await delay(ttdelay);

    /**
     * Evaluate
     */
    let data = await apiResponse;
    let cell = await page.$('tbody > tr > td:nth-child(0n+5)');
    let text = await page.evaluate(cell => cell.textContent, cell);

    expect(text).to.eql('individual-1-edited');
    expect(await data.updateIndividual.name === 'individual-1-edited').to.eql(true);
    expect(await page.title()).to.eql('Zendro');
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
    await delay(ttdelay);

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
    await delay(ttdelay);

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
    expect(await page.title()).to.eql('Zendro');

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
      await delay(ttdelay);

      let apiResponse = null;
      await Promise.all(lastEvents.concat([
        //wait for events
        page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { hidden: true }),
        apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),

        //click
        page.click('button[id=IndividualDeleteConfirmationDialog-button-accept]'),
      ]));
      await delay(ttdelay*2);

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
    expect(await page.title()).to.eql('Zendro');
  });
  }
});

/**
 * Part 2: Associations
 * 
 * <one>(sql) to <many>(sql)
 *   2.1 Associations - one(sql) to many(sql) - add associations - create-panel.
 *   2.2 Associations - one(sql) to many(sql) - associations operations - update-panel.
 *    
 */

/**
 * 2.1 Associations - one(sql) to many(sql) - add associations - create-panel.
 */
describe('2.1 Associations - one(sql) to many(sql) - add associations - create-panel.', function () {
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
    await delay(ttdelay);

    /**
     * Evaluate
     */
    let data = await apiResponse;

    expect(data.countTranscript_counts === 0).to.eql(true);
    expect(await page.title()).to.eql('Zendro');
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
      await delay(ttdelay);
    }

    /**
     * Evaluate
     */
    for(let i=0; i<recordsCount_d2_it02; i++) {
      let data = await responses[i];
      expect(await data.addTranscript_count.gene === `gene-${i+1}`).to.eql(true);
    }
    expect(await page.title()).to.eql('Zendro');
  }).timeout(30000); //30s.

  it('03. Create <individual> record with <transcript_count> associations.', async function () {
    /**
     * #1: go to <individual> table
     */
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
    await delay(ttdelay);
    /**
     * Evaluate
     */
    let data = await apiResponse;
    expect(await data.countIndividuals).to.eql(0);
    expect(await page.title()).to.eql('Zendro');

    /**
     * #2: click on: add <individual>
     */
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAttributesFormView-div-root]', { visible: true }),
      //click
      page.click("button[id=IndividualEnhancedTableToolbar-button-add]"),
    ]);
    await delay(ttdelay);

    /**
     * #3: type input on <individual> attributes form
     */
    await page.click("textarea[id=StringField-Individual-name]");
    await page.type("textarea[id=StringField-Individual-name]", 'individual-1');

    /**
     * #4: click on: <individual> associations tab
     */
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=TranscriptCountsTransferLists-div-root]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      //click
      await page.click("button[id=IndividualCreatePanel-tabsA-button-associations]"),
    ]);
    await delay(ttdelay);
    /**
     * Evaluate
     */
    data = await apiResponse;
    let rowsCount = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    expect(data.countTranscript_counts).to.eql(recordsCount_d2_it02);
    expect(rowsCount).to.eql(recordsCount_d2_it02);
    expect(await page.title()).to.eql('Zendro');

    /*
     * Add associations
     */

    /**
     * #5: click on: add button - item 1
     */
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
    await delay(ttdelay);
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
    expect(await page.title()).to.eql('Zendro');

    /**
     * #6: click on: add button - item 2
     */
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
    await delay(ttdelay);
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

    /**
     * #7: click on: add button - item 3
     */
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
    await delay(ttdelay);
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

    /**
     * #8: click on: remove button - item 2
     */
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
    await delay(ttdelay);
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

    /**
     * #9: click on: save <individual>
     */
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=TranscriptCountAttributesFormView-div-root]', { hidden: true }),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      //click
      page.click("button[id=IndividualCreatePanel-fabButton-save]"),
    ]);
    await delay(ttdelay*2);
    /**
     * Evaluate
     */
    data = await apiResponse;
    let newId = (data&&data.addIndividual) ? data.addIndividual.id : 0;
    let cell = await page.$(`tr[id=IndividualEnhancedTable-row-${newId}] > td:nth-child(5)`); 
    let text = await page.evaluate(cell => cell.textContent, cell);
    
    expect(text).to.eql('individual-1');
    expect(await data.addIndividual.name === 'individual-1').to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    //set global value
    individual_d2_it03 = {...data.addIndividual};

    /**
     * #10: click on: <individual> detail view - on new record
     */
    apiResponse = null;
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAssociationsPage-div-root]', { visible: true }),
      apiResponse = page.waitForResponse('http://localhost:3000/graphql').then((res) => res.json().then((data) => data.data)),
      //click
      page.click(`button[id=IndividualEnhancedTable-row-iconButton-detail-${newId}]`),
    ]);
    await delay(ttdelay);
    /**
     * Evaluate
     */
    data = await apiResponse;
    rowsCountA = await page.$$eval('div[id=TranscriptCountsCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell.textContent).catch((e) => null);
    
    expect(data.readOneIndividual.countFilteredTranscript_counts).to.eql(2);
    expect(rowsCountA).to.eql(2);
    expect(assocId1).to.eql('1');
    expect(assocId3).to.eql('3');
    expect(await page.title()).to.eql('Zendro');

    //click on: close detail panel
    await Promise.all([
      //wait for events
      page.waitForSelector('div[id=IndividualAssociationsPage-div-root]', { hidden: true }),
      page.waitForSelector('tbody[id=IndividualEnhancedTable-tableBody]', { visible: true }),
      
      //click
      page.click("button[id=IndividualDetailPanel-button-close]"),
    ]);
    await delay(ttdelay);
    /**
     * Evaluate
     */
    expect(await page.title()).to.eql('Zendro');
  }).timeout(30000); //30s.
});

/**
 * 
 * 2.2 Associations - one(sql) to many(sql) - associations operations - update-panel.
 */
describe('2.2 Associations - one(sql) to many(sql) - associations operations - update-panel.', function () {
  //general timeout for each test
  this.timeout(tt*3); //10s * 3.

  it('01. Add <transcript_count> associations to <individual>', async function () {
    // #1: click on: update individual button
    let props = {
      elementType: 'button',
      buttonId: 'IndividualEnhancedTable-row-iconButton-edit-'+individual_d2_it03.id,
      visibleId: 'IndividualAttributesFormView-div-root',
    }
    await clickOn(props);

    // #2: click on: associations tab button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-tabsA-button-associations',
      visibleIds: [
        'TranscriptCountsTransferLists-div-root',
        'TranscriptCountsToAddTransferView-list-listA',
        'TranscriptCountsToAddTransferView-div-noItemsB',
        'TranscriptCountsToRemoveTransferView-list-listA',
        'TranscriptCountsToRemoveTransferView-div-noItemsB',
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 4,
    };
    await clickOn(props);
    // evaluate #2
    let datas = (await Promise.all(props.responses)).map((data) => data.data); 
    let rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);    
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(2);
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "3"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: add button - item 2
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-2-button-add',
      visibleId: 'TranscriptCountsToAddTransferView-list-listB',
      hiddenId: 'TranscriptCountsToAddTransferView-div-noItemsB',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-1 });
    expect(datas).to.deep.include({ countTranscript_counts: 1 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "3"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2-1);
    expect(rowsCount_toAddB).to.eql(1);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: add button - item 4
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-4-button-add',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-2 });
    expect(datas).to.deep.include({ countTranscript_counts: 2 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "3"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2-2);
    expect(rowsCount_toAddB).to.eql(2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #4: click on: add button - item 5
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-5-button-add',
      visibleId: 'TranscriptCountsToAddTransferView-div-noDataA',
      hiddenId: 'TranscriptCountsToAddTransferView-list-listA',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #4
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-3 });
    expect(datas).to.deep.include({ countTranscript_counts: 3 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "3"}}]}} });
    expect(rowsCount_toAddB).to.eql(3);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #5: click on: save button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-fabButton-save',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountsTransferLists-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #5
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let cell = await page.$(`tr[id=IndividualEnhancedTable-row-${individual_d2_it03.id}] > td:nth-child(5)`); 
    let text = await page.evaluate(cell => cell.textContent, cell);
    expect(datas).to.deep.include({ updateIndividual: {id: individual_d2_it03.id, name: individual_d2_it03.name } });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(text).to.eql(individual_d2_it03.name);
    expect(await page.title()).to.eql('Zendro');

    // #6: click on: <individual> detail view
    props = {
      elementType: 'button',
      buttonId: `IndividualEnhancedTable-row-iconButton-detail-${individual_d2_it03.id}`,
      visibleId: 'IndividualAssociationsPage-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #6
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCountA = await page.$$eval('div[id=TranscriptCountsCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    let assocId2 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-2]', cell => cell.textContent).catch((e) => null);
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell.textContent).catch((e) => null);
    let assocId4 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-4]', cell => cell.textContent).catch((e) => null);
    let assocId5 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-5]', cell => cell.textContent).catch((e) => null);
    
    expect(datas[0].readOneIndividual.countFilteredTranscript_counts).to.eql(5);
    expect(rowsCountA).to.eql(5);
    expect(assocId1).to.eql('1');
    expect(assocId2).to.eql('2');
    expect(assocId3).to.eql('3');
    expect(assocId4).to.eql('4');
    expect(assocId5).to.eql('5');
    expect(await page.title()).to.eql('Zendro');

    // #7: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'IndividualDetailPanel-button-close',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'IndividualAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #7
    expect(await page.title()).to.eql('Zendro');

  });

  it('02. Remove <transcript_count> associations from <individual>', async function () {
    // #1: click on: update individual button
    let props = {
      elementType: 'button',
      buttonId: 'IndividualEnhancedTable-row-iconButton-edit-'+individual_d2_it03.id,
      visibleId: 'IndividualAttributesFormView-div-root',
    }
    await clickOn(props);

    // #2: click on: associations tab button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-tabsA-button-associations',
      visibleIds: [
        'TranscriptCountsTransferLists-div-root',
        'TranscriptCountsToAddTransferView-div-noDataA',
        'TranscriptCountsToAddTransferView-div-noItemsB',
        'TranscriptCountsToRemoveTransferView-list-listA',
        'TranscriptCountsToRemoveTransferView-div-noItemsB',
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 4,
    };
    await clickOn(props);
    // evaluate #2
    let datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);    
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-5 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "2"}}, {node: {id: "3"}}, {node: {id: "4"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: listA - remove button - item 1
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove',
      visibleId: 'TranscriptCountsToRemoveTransferView-list-listB',
      hiddenId: 'TranscriptCountsToRemoveTransferView-div-noItemsB',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    let isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    let isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    let isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    let isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    let isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 1 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(1);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled2).to.eql(false);
    expect(isDisabled3).to.eql(false);
    expect(isDisabled4).to.eql(false);
    expect(isDisabled5).to.eql(false);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: listA - remove button - item 5
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 2 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(2);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled2).to.eql(false);
    expect(isDisabled3).to.eql(false);
    expect(isDisabled4).to.eql(false);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #4: click on: listA - remove button - item 3
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #4
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 3 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(3);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled2).to.eql(false);
    expect(isDisabled3).to.eql(true);
    expect(isDisabled4).to.eql(false);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #5: click on: listA - remove button - item 2
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #5
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 4 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(4);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled2).to.eql(true);
    expect(isDisabled3).to.eql(true);
    expect(isDisabled4).to.eql(false);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #6: click on: listA - remove button - item 4
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #6
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 5 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(5);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled2).to.eql(true);
    expect(isDisabled3).to.eql(true);
    expect(isDisabled4).to.eql(true);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #7: click on: listB - remove button - item 1
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listB-listItem-1-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #7
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 4 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(4);
    expect(isDisabled1).to.eql(false);
    expect(isDisabled2).to.eql(true);
    expect(isDisabled3).to.eql(true);
    expect(isDisabled4).to.eql(true);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #8: click on: listB - remove button - item 5
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listB-listItem-5-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #8
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled2 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-2-button-remove', (button) => {return button.disabled});
    isDisabled3 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-3-button-remove', (button) => {return button.disabled});
    isDisabled4 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-4-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 3 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(5);
    expect(rowsCount_toRemoveA).to.eql(5);
    expect(rowsCount_toRemoveB).to.eql(3);
    expect(isDisabled1).to.eql(false);
    expect(isDisabled2).to.eql(true);
    expect(isDisabled3).to.eql(true);
    expect(isDisabled4).to.eql(true);
    expect(isDisabled5).to.eql(false);
    expect(await page.title()).to.eql('Zendro');

    // #9: click on: save button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-fabButton-save',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountsTransferLists-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #9
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let cell = await page.$(`tr[id=IndividualEnhancedTable-row-${individual_d2_it03.id}] > td:nth-child(5)`); 
    let text = await page.evaluate(cell => cell.textContent, cell);
    expect(datas).to.deep.include({ updateIndividual: {id: individual_d2_it03.id, name: individual_d2_it03.name } });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(text).to.eql(individual_d2_it03.name);
    expect(await page.title()).to.eql('Zendro');

    // #10: click on: <individual> detail view
    props = {
      elementType: 'button',
      buttonId: `IndividualEnhancedTable-row-iconButton-detail-${individual_d2_it03.id}`,
      visibleId: 'IndividualAssociationsPage-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #10
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCountA = await page.$$eval('div[id=TranscriptCountsCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    let assocId5 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-5]', cell => cell.textContent).catch((e) => null);
    
    expect(datas[0].readOneIndividual.countFilteredTranscript_counts).to.eql(2);
    expect(rowsCountA).to.eql(2);
    expect(assocId1).to.eql('1');
    expect(assocId5).to.eql('5');
    expect(await page.title()).to.eql('Zendro');

    // #11: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'IndividualDetailPanel-button-close',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'IndividualAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #11
    expect(await page.title()).to.eql('Zendro');

  });

  it('03. Add & Remove <transcript_count> associations on <individual>', async function () {
    // #1: click on: update individual button
    let props = {
      elementType: 'button',
      buttonId: 'IndividualEnhancedTable-row-iconButton-edit-'+individual_d2_it03.id,
      visibleId: 'IndividualAttributesFormView-div-root',
    }
    await clickOn(props);

    // #2: click on: associations tab button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-tabsA-button-associations',
      visibleIds: [
        'TranscriptCountsTransferLists-div-root',
        'TranscriptCountsToAddTransferView-list-listA',
        'TranscriptCountsToAddTransferView-div-noItemsB',
        'TranscriptCountsToRemoveTransferView-list-listA',
        'TranscriptCountsToRemoveTransferView-div-noItemsB',
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 4,
    };
    await clickOn(props);
    // evaluate #2
    let datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);    
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(2);
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: toAdd - List A - add button - item 2
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-2-button-add',
      visibleId: 'TranscriptCountsToAddTransferView-list-listB',
      hiddenId: 'TranscriptCountsToAddTransferView-div-noItemsB',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-1 });
    expect(datas).to.deep.include({ countTranscript_counts: 1 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2-1);
    expect(rowsCount_toAddB).to.eql(1);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #4: click on: toAdd - List A - add button - item 4
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-4-button-add',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #4
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-2 });
    expect(datas).to.deep.include({ countTranscript_counts: 2 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2-2);
    expect(rowsCount_toAddB).to.eql(2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #5: click on: toAdd - List A - add button - item 3
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listA-listItem-3-button-add',
      visibleId: 'TranscriptCountsToAddTransferView-div-noDataA',
      hiddenId: 'TranscriptCountsToAddTransferView-list-listA',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #5
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-3 });
    expect(datas).to.deep.include({ countTranscript_counts: 3 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toAddB).to.eql(3);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #6: click on: toAdd - List B - remove button - item 2
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToAddTransferView-listB-listItem-2-button-remove',
      visibleId: 'TranscriptCountsToAddTransferView-list-listA',
      hiddenId: 'TranscriptCountsToAddTransferView-div-noDataA',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #6
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toAddA = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toAddB = await page.$$eval('div[id=TranscriptCountsToAddTransferView-list-listB] > li', rows => rows.length);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    expect(datas).to.deep.include({ countTranscript_counts: recordsCount_d2_it02-2-2 });
    expect(datas).to.deep.include({ countTranscript_counts: 2 });
    expect(datas).to.deep.include({ readOneIndividual: { transcript_countsConnection: {edges: [{node: {id: "1"}}, {node: {id: "5"}}]}} });
    expect(rowsCount_toAddA).to.eql(recordsCount_d2_it02-2-2);
    expect(rowsCount_toAddB).to.eql(2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(await page.title()).to.eql('Zendro');

    // #7: click on: toRemove - listA - remove button - item 1
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove',
      visibleId: 'TranscriptCountsToRemoveTransferView-list-listB',
      hiddenId: 'TranscriptCountsToRemoveTransferView-div-noItemsB',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #7
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    let rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    let isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    let isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 1 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(rowsCount_toRemoveB).to.eql(1);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled5).to.eql(false);
    expect(await page.title()).to.eql('Zendro');

    // #8: click on: listA - remove button - item 5
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #8
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCount_toRemoveA = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listA] > li', rows => rows.length);
    rowsCount_toRemoveB = await page.$$eval('div[id=TranscriptCountsToRemoveTransferView-list-listB] > li', rows => rows.length);
    isDisabled1 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-1-button-remove', (button) => {return button.disabled});
    isDisabled5 = await page.$eval('[id=TranscriptCountsToRemoveTransferView-listA-listItem-5-button-remove', (button) => {return button.disabled});
    expect(datas).to.deep.include({ countTranscript_counts: 2 });
    expect(datas.reduce((a, c) => {
      if(c&&c.readOneIndividual&&c.readOneIndividual.countFilteredTranscript_counts) {
        return a+c.readOneIndividual.countFilteredTranscript_counts;
      } else {
        return a;
      }
    }, 0)).to.eql(2);
    expect(rowsCount_toRemoveA).to.eql(2);
    expect(rowsCount_toRemoveB).to.eql(2);
    expect(isDisabled1).to.eql(true);
    expect(isDisabled5).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #9: click on: save button
    props = {
      elementType: 'button',
      buttonId: 'IndividualUpdatePanel-fabButton-save',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountsTransferLists-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #9
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let cell = await page.$(`tr[id=IndividualEnhancedTable-row-${individual_d2_it03.id}] > td:nth-child(5)`); 
    let text = await page.evaluate(cell => cell.textContent, cell);
    expect(datas).to.deep.include({ updateIndividual: {id: individual_d2_it03.id, name: individual_d2_it03.name } });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(text).to.eql(individual_d2_it03.name);
    expect(await page.title()).to.eql('Zendro');

    // #10: click on: <individual> detail view
    props = {
      elementType: 'button',
      buttonId: `IndividualEnhancedTable-row-iconButton-detail-${individual_d2_it03.id}`,
      visibleId: 'IndividualAssociationsPage-div-root',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #10
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCountA = await page.$$eval('div[id=TranscriptCountsCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell.textContent).catch((e) => null);
    let assocId4 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-4]', cell => cell.textContent).catch((e) => null);
    
    expect(datas[0].readOneIndividual.countFilteredTranscript_counts).to.eql(2);
    expect(rowsCountA).to.eql(2);
    expect(assocId3).to.eql('3');
    expect(assocId4).to.eql('4');
    expect(await page.title()).to.eql('Zendro');

    // #11: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'IndividualDetailPanel-button-close',
      visibleId: 'IndividualEnhancedTable-tableBody',
      hiddenId: 'IndividualAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #11
    expect(await page.title()).to.eql('Zendro');

    /**
     * Validate peer associated records:
     * 
     * #12: click on <transcript_count>
     * #13 - #15: item 1
     * #16 - #18: item 2
     * #19 - #21: item 3
     * #22 - #24: item 4
     * #25 - #27: item 5
     */
    // #12: click on: <transcript_count> left-list item
    props = {
      elementType: 'div',
      buttonId: `MainPanel-listItem-button-transcript_count`,
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #12
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].countTranscript_counts).to.eql(recordsCount_d2_it02);
    expect(await page.title()).to.eql('Zendro');

    // #13: click on: <transcript_count> detail view - item 1
    props = {
      elementType: 'tr',
      buttonId: `TranscriptCountEnhancedTable-row-1`,
      visibleIds: [
        'TranscriptCountAssociationsPage-div-root',
        'AminoacidsequenceCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #13
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.aminoacidsequence).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #14: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #14
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.individual).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #15: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountDetailPanel-button-close',
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #15
    expect(await page.title()).to.eql('Zendro');

    // #16: click on: <transcript_count> detail view - item 2
    props = {
      elementType: 'tr',
      buttonId: `TranscriptCountEnhancedTable-row-2`,
      visibleIds: [
        'TranscriptCountAssociationsPage-div-root',
        'AminoacidsequenceCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #16
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.aminoacidsequence).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #17: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #17
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.individual).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #18: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountDetailPanel-button-close',
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #18
    expect(await page.title()).to.eql('Zendro');

    // #19: click on: <transcript_count> detail view - item 3
    props = {
      elementType: 'tr',
      buttonId: `TranscriptCountEnhancedTable-row-3`,
      visibleIds: [
        'TranscriptCountAssociationsPage-div-root',
        'AminoacidsequenceCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #19
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.aminoacidsequence).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #20: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualCompactView-list-listA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #20
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCountA = await page.$$eval('div[id=IndividualCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    assocId1 = await page.$eval('p[id=IndividualCompactView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    
    expect(datas[0].readOneTranscript_count.individual.id).to.eql("1");
    expect(rowsCountA).to.eql(1);
    expect(assocId1).to.eql('1');
    expect(await page.title()).to.eql('Zendro');

    // #21: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountDetailPanel-button-close',
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #21
    expect(await page.title()).to.eql('Zendro');

    // #22: click on: <transcript_count> detail view - item 4
    props = {
      elementType: 'tr',
      buttonId: `TranscriptCountEnhancedTable-row-4`,
      visibleIds: [
        'TranscriptCountAssociationsPage-div-root',
        'AminoacidsequenceCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #22
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.aminoacidsequence).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #23: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualCompactView-list-listA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #23
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    rowsCountA = await page.$$eval('div[id=IndividualCompactView-list-listA] > div[role=listitem]', rows => rows.length).catch((e) => null);
    assocId1 = await page.$eval('p[id=IndividualCompactView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    
    expect(datas[0].readOneTranscript_count.individual.id).to.eql("1");
    expect(rowsCountA).to.eql(1);
    expect(assocId1).to.eql('1');
    expect(await page.title()).to.eql('Zendro');

    // #24: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountDetailPanel-button-close',
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #24
    expect(await page.title()).to.eql('Zendro');

    // #25: click on: <transcript_count> detail view - item 5
    props = {
      elementType: 'tr',
      buttonId: `TranscriptCountEnhancedTable-row-5`,
      visibleIds: [
        'TranscriptCountAssociationsPage-div-root',
        'AminoacidsequenceCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #25
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.aminoacidsequence).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #26: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualCompactView-div-noDataA'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 1,
    };
    await clickOn(props);
    // evaluate #26
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    expect(datas[0].readOneTranscript_count.individual).to.eql(null);
    expect(await page.title()).to.eql('Zendro');

    // #27: click on: close detail panel
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountDetailPanel-button-close',
      visibleId: 'TranscriptCountEnhancedTable-tableBody',
      hiddenId: 'TranscriptCountAssociationsPage-div-root',
    };
    await clickOn(props);
    // evaluate #27
    expect(await page.title()).to.eql('Zendro');

  });

  it('04. Add & Remove <individual> associations on <transcript_count>', async function () {
    
    /**
     * Add association on <transcript_count> item 1
     */
    // #1: click on: update <transcript_count> button - item 1
    let props = {
      elementType: 'button',
      buttonId: 'TranscriptCountEnhancedTable-row-iconButton-edit-1',
      visibleId: 'TranscriptCountAttributesFormView-div-root',
    }
    await clickOn(props);

    // #2: click on: associations tab button
    props = {
      elementType: 'button',
      buttonId: 'TranscriptCountUpdatePanel-tabsA-button-associations',
      visibleIds: [
        'AminoacidsequenceTransferLists-div-root',
        'AminoacidsequenceToAddTransferView-div-noDataA',
        'AminoacidsequenceToAddTransferView-div-noItemsB',
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 2,
    };
    await clickOn(props);
    // evaluate #2
    let datas = (await Promise.all(props.responses)).map((data) => data.data);
    let errors = (await Promise.all(props.responses)).map((data) => data.errors);
    expect(datas).to.deep.include({ readOneTranscript_count: {aminoacidsequence: null} });
    expect(datas.reduce((a, c) => {
      if(c&&c.countAminoacidsequences === null) {return true} 
      else {return a}
    }, false)).to.eql(true);
    expect(errors.reduce((a, c) => {
      if(c&&Array.isArray(c)){
        return c.reduce((a, c) => {if(c&&c.message === "countRecords() is not implemented for model aminoacidsequence") {
          return true} else return a}, false)}
      else {return a}
    }, false)).to.eql(true);
    expect(await page.title()).to.eql('Zendro');

    // #3: click on: <individual> associations tab
    props = {
      elementType: 'button',
      buttonId: `TranscriptCountUpdatePanel-tabsA-button-individual`,
      visibleIds: [
        'IndividualAssociationsPage-div-root',
        'IndividualToAddTransferView-list-listA',
        'IndividualToAddTransferView-div-noItemsB'
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 3,
    };
    await clickOn(props);
    // evaluate #3
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCount_toAddA = await page.$$eval('div[id=IndividualToAddTransferView-list-listA] > li', rows => rows.length).catch((e) => null);
    let assocId1 = await page.$eval('p[id=IndividualToAddTransferView-listA-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    expect(datas).to.deep.include({ readOneTranscript_count: {individual: null} });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(rowsCount_toAddA).to.eql(1);
    expect(assocId1).to.eql('1');
    expect(await page.title()).to.eql('Zendro');

    // #4: click on: toAdd - List A - add button - item 1
    props = {
      elementType: 'button',
      buttonId: 'IndividualToAddTransferView-listA-listItem-1-button-add',
      visibleIds: [
        'IndividualToAddTransferView-div-noDataA',
        'IndividualToAddTransferView-list-listB',
      ],
      hiddenIds: [
        'IndividualToAddTransferView-list-listA',
        'IndividualToAddTransferView-div-noItemsB',
      ],
      requests: ['http://localhost:3000/graphql'],
      responses: [],
      expectedResponses: 5,
    };
    await clickOn(props);
    // evaluate #5
    datas = (await Promise.all(props.responses)).map((data) => data.data);
    let rowsCount_toAddB = await page.$$eval('div[id=IndividualToAddTransferView-list-listB] > li', rows => rows.length).catch((e) => null);
    assocId1 = await page.$eval('p[id=IndividualToAddTransferView-listB-listItem-id-1]', cell => cell.textContent).catch((e) => null);
    expect(datas).to.deep.include({ readOneTranscript_count: {individual: null} });
    expect(datas).to.deep.include({ countIndividuals: 0 });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(datas).to.deep.include({ individualsConnection: { pageInfo: {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false}, edges: [] } });
    expect(rowsCount_toAddB).to.eql(1);
    expect(assocId1).to.eql('1');
    expect(await page.title()).to.eql('Zendro');

  });

});

/**
 * Utils
 */
async function clickOn(props) {
  let lttdelay = (props.ttdelay) ? props.ttdelay : ttdelay;
  let waitEvents = [];
  if(props.visibleId) 
  waitEvents.push(page.waitForSelector(`[id=${props.visibleId}]`,{ visible: true }));
  if(props.visibleIds) {
    for(let i=0; i<props.visibleIds; i++) {
      waitEvents.push(page.waitForSelector(`[id=${props.visibleIds[i]}]`,{ visible: true }));
    }
  }
  if(props.hiddenId) 
  waitEvents.push(page.waitForSelector(`[id=${props.hiddenId}]`,{ hidden: true }));
  if(props.request1) 
  waitEvents.push(props.response1 = page.waitForResponse(props.request1).then((res) => res.json().then((data) => data)));
  if(props.requests && props.expectedResponses) {
    waitEvents.push(page.waitForResponse((res) => {
      if(props.requests.includes(res.url())){
        props.responses.push(res.json().then((data) => data));
      }
      return(props.responses.length === props.expectedResponses);
    }));
  }

  await Promise.all([
    //wait for events
    ...waitEvents,

    //click
    page.click(`${props.elementType}[id=${props.buttonId}]`),
  ]);

  await delay(lttdelay);
}

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
const ttdelay = 400;
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
    let text = await page.evaluate(cell => cell ? cell.textContent : null , cell);

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
    let text1 = await page.evaluate(cell => cell ? cell.textContent : null , cell1);
    let text2 = await page.evaluate(cell => cell ? cell.textContent : null , cell2);
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

if(false){
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
      await page.type("textarea[id=StringField-TranscriptCount-gene]", inputNotOk.gene);
      await page.click("textarea[id=StringField-TranscriptCount-variable]");
      await page.type("textarea[id=StringField-TranscriptCount-variable]", inputNotOk.variable);
      await page.click("input[id=FloatField-TranscriptCount-count]");
      await page.type("input[id=FloatField-TranscriptCount-count]", inputNotOk.count);
      await page.click("textarea[id=StringField-TranscriptCount-tissue_or_condition]");
      await page.type("textarea[id=StringField-TranscriptCount-tissue_or_condition]", inputNotOk.tissue_or_condition);
  
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
    let text = await page.evaluate(cell => cell ? cell.textContent : null , cell);
    
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
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
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
}

if(false){
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
    let text = await page.evaluate(cell => cell ? cell.textContent : null , cell);
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
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId2 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-2]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId4 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-4]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId5 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-5]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
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
    let text = await page.evaluate(cell => cell ? cell.textContent : null , cell);
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
    let assocId1 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-1]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId5 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-5]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
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
    let text = await page.evaluate(cell => cell ? cell.textContent : null , cell);
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
    let assocId3 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    let assocId4 = await page.$eval('p[id=TranscriptCountsCompactView-listA-listItem-id-4]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
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
    assocId3 = await page.$eval('p[id=IndividualCompactView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
    expect(datas[0].readOneTranscript_count.individual.id).to.eql("3");
    expect(rowsCountA).to.eql(1);
    expect(assocId3).to.eql('3');
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
    assocId3 = await page.$eval('p[id=IndividualCompactView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    
    expect(datas[0].readOneTranscript_count.individual.id).to.eql("3");
    expect(rowsCountA).to.eql(1);
    expect(assocId3).to.eql('3');
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
      ttdelay: ttdelay*2,
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
    let assocId3 = await page.$eval('p[id=IndividualToAddTransferView-listA-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    expect(datas).to.deep.include({ readOneTranscript_count: {individual: null} });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(rowsCount_toAddA).to.eql(1);
    expect(assocId3).to.eql('3');
    expect(await page.title()).to.eql('Zendro');

    // #4: click on: toAdd - List A - add button - item 3
    props = {
      elementType: 'button',
      buttonId: 'IndividualToAddTransferView-listA-listItem-3-button-add',
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
    assocId3 = await page.$eval('p[id=IndividualToAddTransferView-listB-listItem-id-3]', cell => cell ? cell.textContent : null ).catch((e) => null);
    expect(datas).to.deep.include({ readOneTranscript_count: {individual: null} });
    expect(datas).to.deep.include({ countIndividuals: 0 });
    expect(datas).to.deep.include({ countIndividuals: 1 });
    expect(datas).to.deep.include({ individualsConnection: { pageInfo: {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false}, edges: [] } });
    expect(rowsCount_toAddB).to.eql(1);
    expect(assocId3).to.eql('3');
    expect(await page.title()).to.eql('Zendro');

  });

});
}

/**
 * Part 3: AJV Validations
 * 
 *   3.1 AJV Validations - create-panel.
 *   3.2 AJV Validations - update-panel.
 *    
 */
if(true)
describe('3. AJV Validations', function() {
  //inputs & outputs
  let inputNotOk = {
    string_1: "too large string",
    string_2: "abcd",
    int_1: "1001",
    int_2: "99",
    float_1: "7.279",
    float_2: "10.5678",
    boolean_1: false,
    boolean_2: true,
    date_1: "2020-07-21",
    date_2: "2020-07-21",
    dateTime_1: "2020-07-21 21:36:42.613",
    dateTime_2: "2020-07-21 21:36:42.613",
    time_1: "21:36:42.620",
    time_2: "21:36:42.620",
  }

  let inputOk = {
    string_1: "abcde",
    string_2: "abcde",
    int_1: "1000",
    int_2: "100",
    float_1: "7.28",
    float_2: "10.567",
    boolean_1: true,
    boolean_2: false,
    date_1: null,
    date_2: null,
    dateTime_1: null,
    dateTime_2: null,
    time_1: null,
    time_2: null,
  }

  let ajvValidationErrors = [
    {
      "keyword": "maxLength",
      "dataPath": ".string_1",
      "schemaPath": "#/properties/string_1/maxLength",
      "params": {
        "limit": 5
      },
      "message": "should NOT be longer than 5 characters"
    },
    {
      "keyword": "minLength",
      "dataPath": ".string_2",
      "schemaPath": "#/properties/string_2/minLength",
      "params": {
        "limit": 5
      },
      "message": "should NOT be shorter than 5 characters"
    },
    {
      "keyword": "maximum",
      "dataPath": ".int_1",
      "schemaPath": "#/properties/int_1/maximum",
      "params": {
        "comparison": "<=",
        "limit": 1000,
        "exclusive": false
      },
      "message": "should be <= 1000"
    },
    {
      "keyword": "minimum",
      "dataPath": ".int_2",
      "schemaPath": "#/properties/int_2/minimum",
      "params": {
        "comparison": ">=",
        "limit": 100,
        "exclusive": false
      },
      "message": "should be >= 100"
    },
    {
      "keyword": "minimum",
      "dataPath": ".float_1",
      "schemaPath": "#/properties/float_1/minimum",
      "params": {
        "comparison": ">=",
        "limit": 7.28,
        "exclusive": false
      },
      "message": "should be >= 7.28"
    },
    {
      "keyword": "maximum",
      "dataPath": ".float_2",
      "schemaPath": "#/properties/float_2/maximum",
      "params": {
        "comparison": "<=",
        "limit": 10.567,
        "exclusive": false
      },
      "message": "should be <= 10.567"
    },
    {
      "keyword": "enum",
      "dataPath": ".boolean_1",
      "schemaPath": "#/properties/boolean_1/enum",
      "params": {
        "allowedValues": [
          true
        ]
      },
      "message": "should be equal to one of the allowed values"
    },
    {
      "keyword": "enum",
      "dataPath": ".boolean_2",
      "schemaPath": "#/properties/boolean_2/enum",
      "params": {
        "allowedValues": [
          false
        ]
      },
      "message": "should be equal to one of the allowed values"
    },
    {
      "keyword": "type",
      "dataPath": ".date_1",
      "schemaPath": "#/properties/date_1/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    },
    {
      "keyword": "type",
      "dataPath": ".date_2",
      "schemaPath": "#/properties/date_2/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    },
    {
      "keyword": "type",
      "dataPath": ".dateTime_1",
      "schemaPath": "#/properties/dateTime_1/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    },
    {
      "keyword": "type",
      "dataPath": ".dateTime_2",
      "schemaPath": "#/properties/dateTime_2/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    },
    {
      "keyword": "type",
      "dataPath": ".time_1",
      "schemaPath": "#/properties/time_1/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    },
    {
      "keyword": "type",
      "dataPath": ".time_2",
      "schemaPath": "#/properties/time_2/type",
      "params": {
        "type": "null"
      },
      "message": "should be null"
    }
  ];
  
  describe('3.1. Create panel', function () {
    let validationErrors = [...ajvValidationErrors];
    describe('3.1.1. <with_validations> table is empty', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: <with_validations>`, async function() {
        props = {
          elementType: 'div',
          buttonId: 'MainPanel-listItem-button-with_validations',
          visibleId: 'WithValidationsEnhancedTable-box-noData',
          hiddenId: 'WithValidationsEnhancedTable-tableBody',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 2,
        };
        await clickOn(props);
        // evaluate
        let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
        expect(datas).to.include.deep.members([{data: {countWith_validations: 0}}]);
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('3.1.2. Add <with_validations> record with invalid values', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: add <with_validations>`, async function () {
        let props = {
          elementType: 'button',
          buttonId: 'WithValidationsEnhancedTableToolbar-button-add',
          visibleId: 'WithValidationsAttributesFormView-div-root'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - invalid value - string_1`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_1]");
        await page.type("textarea[id=StringField-WithValidations-string_1]", inputNotOk.string_1);
      });

      it(`${n++}. type on: input field - invalid value - string_2`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_2]");
        await page.type("textarea[id=StringField-WithValidations-string_2]", inputNotOk.string_2);
      });

      it(`${n++}. type on: input field - invalid value - int_1`, async function () {
        await page.click("input[id=IntField-WithValidations-int_1]");
        await page.type("input[id=IntField-WithValidations-int_1]", inputNotOk.int_1);
      });
      it(`${n++}. type on: input field - invalid value - int_2`, async function () {
        await page.click("input[id=IntField-WithValidations-int_2]");
        await page.type("input[id=IntField-WithValidations-int_2]", inputNotOk.int_2);
      });
      it(`${n++}. type on: input field - invalid value - float_1`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_1]");
        await page.type("input[id=FloatField-WithValidations-float_1]", inputNotOk.float_1);
      });
      it(`${n++}. type on: input field - invalid value - float_2`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_2]");
        await page.type("input[id=FloatField-WithValidations-float_2]", inputNotOk.float_2);
      });
      it(`${n++}. type on: input field - invalid value - boolean_1`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_1]");
        await page.click("input[id=BoolField-WithValidations-boolean_1]");
      });
      it(`${n++}. type on: input field - invalid value - boolean_2`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_2]");
      });
      it(`${n++}. type on: input field - invalid value - date_1`, async function () {
        await page.click("input[id=DateField-WithValidations-date_1]");
        await page.type("input[id=DateField-WithValidations-date_1]", inputNotOk.date_1);
      });
      it(`${n++}. type on: input field - invalid value - date_2`, async function () {
        await page.click("input[id=DateField-WithValidations-date_2]");
        await page.type("input[id=DateField-WithValidations-date_2]", inputNotOk.date_2);
      });
      it(`${n++}. type on: input field - invalid value - dateTime_1`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_1]");
        await page.type("input[id=DateTimeField-WithValidations-dateTime_1]", inputNotOk.dateTime_1);
      });
      it(`${n++}. type on: input field - invalid value - dateTime_2`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_2]");
        await page.type("input[id=DateTimeField-WithValidations-dateTime_2]", inputNotOk.dateTime_2);
      });
      it(`${n++}. type on: input field - invalid value - time_1`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_1]");
        await page.type("input[id=TimeField-WithValidations-time_1]", inputNotOk.time_1);
      });
      it(`${n++}. type on: input field - invalid value - time_2`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_2]");
        await page.type("input[id=TimeField-WithValidations-time_2]", inputNotOk.time_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
        expect(datas.length).to.eql(1);
        expect(datas[0].data).to.eql(null);
        expect(datas[0].errors.length).to.eql(1);
        expect(datas[0].errors[0].message).to.eql("validation failed");
        expect(datas[0].errors[0].path).to.eql(["addWith_validations"]);
        expect(datas[0].errors[0].extensions.validationErrors.length).to.eql(14);
        expect(datas[0].errors[0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });
    });

    describe('3.1.3. Add <with_validations> record with valid values', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. type on: input field - valid value - string_1`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_1]", { clickCount: 3 });
        await page.type("textarea[id=StringField-WithValidations-string_1]", inputOk.string_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(13);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - string_2`, async function () {
         await page.click("textarea[id=StringField-WithValidations-string_2]", { clickCount: 3 });
         await page.type("textarea[id=StringField-WithValidations-string_2]", inputOk.string_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(12);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - int_1`, async function () {
         await page.click("input[id=IntField-WithValidations-int_1]", { clickCount: 3 });
         await page.type("input[id=IntField-WithValidations-int_1]", inputOk.int_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(11);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - int_2`, async function () {
         await page.click("input[id=IntField-WithValidations-int_2]", { clickCount: 3 });
         await page.type("input[id=IntField-WithValidations-int_2]", inputOk.int_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(10);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - float_1`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_1]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_1]", inputOk.float_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(9);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - float_2`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_2]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_2]", inputOk.float_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(8);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - boolean_1`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_1]");
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(7);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - boolean_2`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_2]");
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(6);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - date_1`, async function () {
        await page.click("input[id=DateField-WithValidations-date_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(5);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - date_2`, async function () {
        await page.click("input[id=DateField-WithValidations-date_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(4);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - dateTime_1`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(3);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - dateTime_2`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(2);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - time_1`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["addWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(1);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - time_2`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsCreatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-create',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-create-button-accept',
          visibleId: 'WithValidationsEnhancedTable-tableBody',
          hiddenId: 'WithValidationsAttributesFormView-div-root',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 3,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        let texts = {};
        let cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(4)`); 
        texts.id = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(5)`); 
        texts.string_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(6)`); 
        texts.string_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(7)`); 
        texts.int_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(8)`); 
        texts.int_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(9)`); 
        texts.float_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(10)`); 
        texts.float_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(11)`); 
        texts.boolean_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(12)`); 
        texts.boolean_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(13)`); 
        texts.date_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(14)`); 
        texts.date_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(15)`); 
        texts.dateTime_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(16)`); 
        texts.dateTime_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(17)`); 
        texts.time_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(18)`); 
        texts.time_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        expect(datas).to.deep.include({ 
          addWith_validations: {
            id: '1',
            string_1: 'abcde',
            string_2: 'abcde',
            int_1: 1000,
            int_2: 100,
            float_1: 7.28,
            float_2: 10.567,
            boolean_1: true,
            boolean_2: false,
            date_1: null,
            date_2: null,
            dateTime_1: null,
            dateTime_2: null,
            time_1: null,
            time_2: null
        } });
        expect(datas).to.deep.include({ countWith_validations: 1 });
        expect(texts.id).to.eql('1');
        expect(texts.string_1).to.eql('abcde');
        expect(texts.string_2).to.eql('abcde');
        expect(texts.int_1).to.eql('1000');
        expect(texts.int_2).to.eql('100');
        expect(texts.float_1).to.eql('7.28');
        expect(texts.float_2).to.eql('10.567');
        expect(texts.boolean_1).to.eql('true');
        expect(texts.boolean_2).to.eql('false');
        expect(texts.date_1).to.eql('');
        expect(texts.date_2).to.eql('');
        expect(texts.dateTime_1).to.eql('');
        expect(texts.dateTime_2).to.eql('');
        expect(texts.time_1).to.eql('');
        expect(texts.time_2).to.eql('');
        expect(await page.title()).to.eql('Zendro');
      });
    });
  });

  describe('3.2. Update panel', function () {
    let validationErrors = [...ajvValidationErrors];
    describe('3.2.2. Update <with_validations> record with invalid values', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: update <with_validations>`, async function () {
        let props = {
          elementType: 'button',
          buttonId: 'WithValidationsEnhancedTable-row-iconButton-edit-1',
          visibleId: 'WithValidationsAttributesFormView-div-root'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - invalid value - string_1`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_1]", { clickCount: 3 });
        await page.type("textarea[id=StringField-WithValidations-string_1]", inputNotOk.string_1);
      });

      it(`${n++}. type on: input field - invalid value - string_2`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_2]", { clickCount: 3 });
        await page.type("textarea[id=StringField-WithValidations-string_2]", inputNotOk.string_2);
      });

      it(`${n++}. type on: input field - invalid value - int_1`, async function () {
        await page.click("input[id=IntField-WithValidations-int_1]", { clickCount: 3 });
        await page.type("input[id=IntField-WithValidations-int_1]", inputNotOk.int_1);
      });
      it(`${n++}. type on: input field - invalid value - int_2`, async function () {
        await page.click("input[id=IntField-WithValidations-int_2]", { clickCount: 3 });
        await page.type("input[id=IntField-WithValidations-int_2]", inputNotOk.int_2);
      });
      it(`${n++}. type on: input field - invalid value - float_1`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_1]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_1]", inputNotOk.float_1);
      });
      it(`${n++}. type on: input field - invalid value - float_2`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_2]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_2]", inputNotOk.float_2);
      });
      it(`${n++}. type on: input field - invalid value - boolean_1`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_1]");
      });
      it(`${n++}. type on: input field - invalid value - boolean_2`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_2]");
      });
      it(`${n++}. type on: input field - invalid value - date_1`, async function () {
        await page.click("input[id=DateField-WithValidations-date_1]", { clickCount: 3 });
        await page.type("input[id=DateField-WithValidations-date_1]", inputNotOk.date_1);
      });
      it(`${n++}. type on: input field - invalid value - date_2`, async function () {
        await page.click("input[id=DateField-WithValidations-date_2]", { clickCount: 3 });
        await page.type("input[id=DateField-WithValidations-date_2]", inputNotOk.date_2);
      });
      it(`${n++}. type on: input field - invalid value - dateTime_1`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_1]", { clickCount: 3 });
        await page.type("input[id=DateTimeField-WithValidations-dateTime_1]", inputNotOk.dateTime_1);
      });
      it(`${n++}. type on: input field - invalid value - dateTime_2`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_2]", { clickCount: 3 });
        await page.type("input[id=DateTimeField-WithValidations-dateTime_2]", inputNotOk.dateTime_2);
      });
      it(`${n++}. type on: input field - invalid value - time_1`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_1]", { clickCount: 3 });
        await page.type("input[id=TimeField-WithValidations-time_1]", inputNotOk.time_1);
      });
      it(`${n++}. type on: input field - invalid value - time_2`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_2]", { clickCount: 3 });
        await page.type("input[id=TimeField-WithValidations-time_2]", inputNotOk.time_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
        expect(datas.length).to.eql(1);
        expect(datas[0].data).to.eql(null);
        expect(datas[0].errors.length).to.eql(1);
        expect(datas[0].errors[0].message).to.eql("validation failed");
        expect(datas[0].errors[0].path).to.eql(["updateWith_validations"]);
        expect(datas[0].errors[0].extensions.validationErrors.length).to.eql(14);
        expect(datas[0].errors[0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });
    });

    describe('3.2.3. Update <with_validations> record with valid values', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. type on: input field - valid value - string_1`, async function () {
        await page.click("textarea[id=StringField-WithValidations-string_1]", { clickCount: 3 });
        await page.type("textarea[id=StringField-WithValidations-string_1]", inputOk.string_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(13);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - string_2`, async function () {
         await page.click("textarea[id=StringField-WithValidations-string_2]", { clickCount: 3 });
         await page.type("textarea[id=StringField-WithValidations-string_2]", inputOk.string_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(12);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - int_1`, async function () {
         await page.click("input[id=IntField-WithValidations-int_1]", { clickCount: 3 });
         await page.type("input[id=IntField-WithValidations-int_1]", inputOk.int_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(11);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - int_2`, async function () {
         await page.click("input[id=IntField-WithValidations-int_2]", { clickCount: 3 });
         await page.type("input[id=IntField-WithValidations-int_2]", inputOk.int_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(10);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - float_1`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_1]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_1]", inputOk.float_1);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(9);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - float_2`, async function () {
        await page.click("input[id=FloatField-WithValidations-float_2]", { clickCount: 3 });
        await page.type("input[id=FloatField-WithValidations-float_2]", inputOk.float_2);
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(8);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - boolean_1`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_1]");
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(7);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - boolean_2`, async function () {
        await page.click("input[id=BoolField-WithValidations-boolean_2]");
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(6);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - date_1`, async function () {
        await page.click("input[id=DateField-WithValidations-date_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(5);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - date_2`, async function () {
        await page.click("input[id=DateField-WithValidations-date_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(4);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - dateTime_1`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(3);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - dateTime_2`, async function () {
        await page.click("input[id=DateTimeField-WithValidations-dateTime_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(2);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - time_1`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_1]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'Snackbar-card',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 1,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        errors = (await Promise.all(props.responses)).map((data) => data.errors);
        expect(datas).to.eql([null]);
        expect(errors.length).to.eql(1);
        expect(errors[0][0].message).to.eql("validation failed");
        expect(errors[0][0].path).to.eql(["updateWith_validations"]);
        expect(errors[0][0].extensions.validationErrors.length).to.eql(1);
        validationErrors.shift();
        expect(errors[0][0].extensions.validationErrors).to.have.deep.members(validationErrors);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. click on: close <Snackbar>`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'Snackbar-button-close',
          hiddenId: 'Snackbar-card'
        };
        await clickOn(props);
      });

      it(`${n++}. type on: input field - valid value - time_2`, async function () {
        await page.click("input[id=TimeField-WithValidations-time_2]", { clickCount: 3 });
        await page.keyboard.press('Backspace');
      });

      it(`${n++}. click on: save button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsUpdatePanel-fabButton-save',
          visibleId: 'WithValidationsConfirmationDialog-update',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: accept button`, async function () {
        props = {
          elementType: 'button',
          buttonId: 'WithValidationsConfirmationDialog-update-button-accept',
          visibleId: 'WithValidationsEnhancedTable-tableBody',
          hiddenId: 'WithValidationsAttributesFormView-div-root',
          requests: ['http://localhost:3000/graphql'],
          responses: [],
          expectedResponses: 3,
        };
        await clickOn(props);
        // evaluate
        datas = (await Promise.all(props.responses)).map((data) => data.data);
        let texts = {};
        let cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(4)`); 
        texts.id = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(5)`); 
        texts.string_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(6)`); 
        texts.string_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(7)`); 
        texts.int_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(8)`); 
        texts.int_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(9)`); 
        texts.float_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(10)`); 
        texts.float_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(11)`); 
        texts.boolean_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(12)`); 
        texts.boolean_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(13)`); 
        texts.date_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(14)`); 
        texts.date_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(15)`); 
        texts.dateTime_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(16)`); 
        texts.dateTime_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(17)`); 
        texts.time_1 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        cell = await page.$(`tr[id=WithValidationsEnhancedTable-row-1] > td:nth-child(18)`); 
        texts.time_2 = await page.evaluate(cell => cell ? cell.textContent : null , cell);
        expect(datas).to.deep.include({ 
          updateWith_validations: {
            id: '1',
            string_1: 'abcde',
            string_2: 'abcde',
            int_1: 1000,
            int_2: 100,
            float_1: 7.28,
            float_2: 10.567,
            boolean_1: true,
            boolean_2: false,
            date_1: null,
            date_2: null,
            dateTime_1: null,
            dateTime_2: null,
            time_1: null,
            time_2: null
        } });
        expect(datas).to.deep.include({ countWith_validations: 1 });
        expect(texts.id).to.eql('1');
        expect(texts.string_1).to.eql('abcde');
        expect(texts.string_2).to.eql('abcde');
        expect(texts.int_1).to.eql('1000');
        expect(texts.int_2).to.eql('100');
        expect(texts.float_1).to.eql('7.28');
        expect(texts.float_2).to.eql('10.567');
        expect(texts.boolean_1).to.eql('true');
        expect(texts.boolean_2).to.eql('false');
        expect(texts.date_1).to.eql('');
        expect(texts.date_2).to.eql('');
        expect(texts.dateTime_1).to.eql('');
        expect(texts.dateTime_2).to.eql('');
        expect(texts.time_1).to.eql('');
        expect(texts.time_2).to.eql('');
        expect(await page.title()).to.eql('Zendro');
      });
    });
  });

});

/**
 * Part 4: ACL Validations
 * 
 *   4.1 ACL - administrator.
 *    
 */
describe('4. ACL Validations', function() {
  let adminModels = {
    namesCp: [ "Role", "Role_to_user", "User"],
  }

  if(true)
  describe('4.1. Role - administrator', function() {
    describe('4.1.1 Login', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: logout`, async function() {
        props = {
          buttonId: 'MainPanel-button-logout',
          visibleId: 'LoginPage-div-root',
        };
        await clickOn(props);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. type on: input field - email`, async function () {
        await page.click("input[id=LoginPage-textField-email]");
        await page.type("input[id=LoginPage-textField-email]", 'uadmin@zen.dro');
      });

      it(`${n++}. type on: input field - password`, async function () {
        await page.click("input[id=LoginPage-textField-password]");
        await page.type("input[id=LoginPage-textField-password]", 'admin');
      });

      it(`${n++}. login: with uadmin user`, async function() {
        props = {
          buttonId: 'LoginPage-button-login',
          visibleId: 'MainPanel-div-root',
          hiddenId: 'LoginPage-div-root',
        };
        await clickOn(props);
        //evaluate
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.1.2 Main menu - no regular models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: collapse models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleId: 'MainPanel-listItem-icon-models-expandMore',
          hiddenId: 'MainPanel-collapse-models',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: expand models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleIds: [
            'MainPanel-listItem-icon-models-expandLess',
            'MainPanel-collapse-models',
          ],
          hiddenId: 'MainPanel-listItem-icon-models-expandMore',
        };
        await clickOn(props);
        // evaluate
        let modelsCount = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.length);
        expect(modelsCount).to.eql(0);
        expect(await page.title()).to.eql('Zendro');
      });

    });

    describe('4.1.3 Main menu - admin models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: collapse admin models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-admin',
          visibleId: 'MainPanel-listItem-icon-admin-expandMore',
          hiddenId: 'MainPanel-collapse-admin',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: expand admin models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-admin',
          visibleIds: [
            'MainPanel-listItem-icon-admin-expandLess',
            'MainPanel-collapse-admin',
          ],
          hiddenId: 'MainPanel-listItem-icon-admin-expandMore',
        };
        await clickOn(props);
        // evaluate
        let adminItemsContent = await page.$$eval('[id=MainPanel-collapse-list-admin] > div[role=button]', items => items.map(item=>item.textContent));
        expect(adminItemsContent).to.have.deep.members(adminModels.namesCp);
        expect(await page.title()).to.eql('Zendro');
      });

    });

    describe('4.1.4 CRUD permission in <user> admin model - allowed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      let q2 = {
        "data": {
          "countUsers": 5
        }
      };
      let q1 = {
        "data": {
          "usersConnection": {
            "pageInfo": {
              "startCursor": "eyJlbWFpbCI6ImFkbWluQHplbi5kcm8iLCJwYXNzd29yZCI6IiQyYiQxMCRKYVYyQjE5SFQxOUZGL1VlTG9tSHhlNW9ocnZYQ1dUSVJRanVGN3l6ejVUYm5sT3FPLkhLYSIsImlkIjoxfQ==",
              "endCursor": "eyJlbWFpbCI6InVhZG1pbkB6ZW4uZHJvIiwicGFzc3dvcmQiOiIkMmIkMTAkSmFWMkIxOUhUMTlGRi9VZUxvbUh4ZTVvaHJ2WENXVElSUWp1Rjd5eno1VGJubE9xTy5IS2EiLCJpZCI6NX0=",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "email": "admin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "2",
                  "email": "uacl_validations@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "3",
                  "email": "ureader@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "4",
                  "email": "ueditor@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "5",
                  "email": "uadmin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              }
            ]
          }
        }
      };
      let q3 = {
        "data": {
          "readOneUser": {
            "rolesConnection": {
              "pageInfo": {
                "startCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
                "endCursor": "eyJuYW1lIjoiYWNsX3ZhbGlkYXRpb25zLXJvbGUiLCJkZXNjcmlwdGlvbiI6bnVsbCwiaWQiOjR9",
                "hasPreviousPage": false,
                "hasNextPage": false
              },
              "edges": [
                {
                  "node": {
                    "id": "1",
                    "name": "administrator",
                    "description": null
                  }
                },
                {
                  "node": {
                    "id": "2",
                    "name": "reader",
                    "description": null
                  }
                },
                {
                  "node": {
                    "id": "3",
                    "name": "editor",
                    "description": null
                  }
                },
                {
                  "node": {
                    "id": "4",
                    "name": "acl_validations-role",
                    "description": null
                  }
                }
              ]
            },
            "countFilteredRoles": 4
          }
        }
      };
      let q4 = {
        "data": {
          "countRoles": 4
        }
      };
      let q5 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
              "endCursor": "eyJuYW1lIjoiYWNsX3ZhbGlkYXRpb25zLXJvbGUiLCJkZXNjcmlwdGlvbiI6bnVsbCwiaWQiOjR9",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "name": "administrator",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "2",
                  "name": "reader",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "3",
                  "name": "editor",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "4",
                  "name": "acl_validations-role",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q6 = {
        "data": {
          "countRoles": 3
        }
      };
      let q7 = {
        "data": {
          "countRoles": 1
        }
      };
      let q8 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoicmVhZGVyIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjoyfQ==",
              "endCursor": "eyJuYW1lIjoiYWNsX3ZhbGlkYXRpb25zLXJvbGUiLCJkZXNjcmlwdGlvbiI6bnVsbCwiaWQiOjR9",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "2",
                  "name": "reader",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "3",
                  "name": "editor",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "4",
                  "name": "acl_validations-role",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q9 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
              "endCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "name": "administrator",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q10 = {
        "data": {
          "addUser": {
            "id": "6",
            "email": "user1@zen.dro",
            "password": "to_be_assigned"
          }
        }
      };
      let q11 = {
        "data": {
          "countUsers": 6
        }
      };
      let q12 = {
        "data": {
          "usersConnection": {
            "pageInfo": {
              "startCursor": "eyJlbWFpbCI6ImFkbWluQHplbi5kcm8iLCJwYXNzd29yZCI6IiQyYiQxMCRKYVYyQjE5SFQxOUZGL1VlTG9tSHhlNW9ocnZYQ1dUSVJRanVGN3l6ejVUYm5sT3FPLkhLYSIsImlkIjoxfQ==",
              "endCursor": "to_be_assigned",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "email": "admin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "2",
                  "email": "uacl_validations@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "3",
                  "email": "ureader@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "4",
                  "email": "ueditor@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "5",
                  "email": "uadmin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
            ]
          }
        }
      }
      let q13 = {
        "data": {
          "readOneUser": {
            "rolesConnection": {
              "edges": [
                {
                  "node": {
                    "id": "1"
                  }
                }
              ]
            }
          }
        }
      };
      let q14 = {
        "data": {
          "readOneUser": {
            "rolesConnection": {
              "pageInfo": {
                "startCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
                "endCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
                "hasPreviousPage": false,
                "hasNextPage": false
              },
              "edges": [
                {
                  "node": {
                    "id": "1",
                    "name": "administrator",
                    "description": null
                  }
                }
              ]
            },
            "countFilteredRoles": 1
          }
        }
      };
      let q15 = {
        "data": {
          "countRoles": 3
        }
      };
      let q16 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoicmVhZGVyIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjoyfQ==",
              "endCursor": "eyJuYW1lIjoiYWNsX3ZhbGlkYXRpb25zLXJvbGUiLCJkZXNjcmlwdGlvbiI6bnVsbCwiaWQiOjR9",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "2",
                  "name": "reader",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "3",
                  "name": "editor",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "4",
                  "name": "acl_validations-role",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q17 = {
        "data": {
          "readOneUser": {
            "rolesConnection": {
              "edges": [
                {
                  "node": {
                    "id": "1"
                  }
                }
              ]
            }
          }
        }
      };
      let q18 = {
        "data": {
          "countRoles": 1
        }
      }
      let q19 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoicmVhZGVyIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjoyfQ==",
              "endCursor": "eyJuYW1lIjoicmVhZGVyIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjoyfQ==",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "2",
                  "name": "reader",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q20 = {
        "data": {
          "countRoles": 2
        }
      };
      let q21 = {
        "data": {
          "rolesConnection": {
            "pageInfo": {
              "startCursor": "eyJuYW1lIjoiZWRpdG9yIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjozfQ==",
              "endCursor": "eyJuYW1lIjoiYWNsX3ZhbGlkYXRpb25zLXJvbGUiLCJkZXNjcmlwdGlvbiI6bnVsbCwiaWQiOjR9",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "3",
                  "name": "editor",
                  "description": null
                }
              },
              {
                "node": {
                  "id": "4",
                  "name": "acl_validations-role",
                  "description": null
                }
              }
            ]
          }
        }
      };
      let q22 = {
        "data": {
          "updateUser": {
            "id": "6",
            "email": "user1_edited@zen.dro",
            "password": "to_be_assigned"
          }
        }
      };
      let q23 = {
        "data": {
          "countUsers": 6
        }
      };
      let q24 = {
        "data": {
          "usersConnection": {
            "pageInfo": {
              "startCursor": "eyJlbWFpbCI6ImFkbWluQHplbi5kcm8iLCJwYXNzd29yZCI6IiQyYiQxMCRKYVYyQjE5SFQxOUZGL1VlTG9tSHhlNW9ocnZYQ1dUSVJRanVGN3l6ejVUYm5sT3FPLkhLYSIsImlkIjoxfQ==",
              "endCursor": "to_be_assigned",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "email": "admin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "2",
                  "email": "uacl_validations@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "3",
                  "email": "ureader@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "4",
                  "email": "ueditor@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "5",
                  "email": "uadmin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
            ]
          }
        }
      };
      let q25 = {
        "data": {
          "readOneUser": {
            "rolesConnection": {
              "pageInfo": {
                "startCursor": "eyJuYW1lIjoiYWRtaW5pc3RyYXRvciIsImRlc2NyaXB0aW9uIjpudWxsLCJpZCI6MX0=",
                "endCursor": "eyJuYW1lIjoicmVhZGVyIiwiZGVzY3JpcHRpb24iOm51bGwsImlkIjoyfQ==",
                "hasPreviousPage": false,
                "hasNextPage": false
              },
              "edges": [
                {
                  "node": {
                    "id": "1",
                    "name": "administrator",
                    "description": null
                  }
                },
                {
                  "node": {
                    "id": "2",
                    "name": "reader",
                    "description": null
                  }
                }
              ]
            },
            "countFilteredRoles": 2
          }
        }
      };
      let q26 = {
        "data": {
          "deleteUser": "Item successfully deleted"
        }
      };
      let q27 = {
        "data": {
          "countUsers": 5
        }
      };
      let q28 = {
        "data": {
          "usersConnection": {
            "pageInfo": {
              "startCursor": "eyJlbWFpbCI6ImFkbWluQHplbi5kcm8iLCJwYXNzd29yZCI6IiQyYiQxMCRKYVYyQjE5SFQxOUZGL1VlTG9tSHhlNW9ocnZYQ1dUSVJRanVGN3l6ejVUYm5sT3FPLkhLYSIsImlkIjoxfQ==",
              "endCursor": "eyJlbWFpbCI6InVhZG1pbkB6ZW4uZHJvIiwicGFzc3dvcmQiOiIkMmIkMTAkSmFWMkIxOUhUMTlGRi9VZUxvbUh4ZTVvaHJ2WENXVElSUWp1Rjd5eno1VGJubE9xTy5IS2EiLCJpZCI6NX0=",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "email": "admin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "2",
                  "email": "uacl_validations@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "3",
                  "email": "ureader@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "4",
                  "email": "ueditor@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              },
              {
                "node": {
                  "id": "5",
                  "email": "uadmin@zen.dro",
                  "password": "$2b$10$JaV2B19HT19FF/UeLomHxe5ohrvXCWTIRQjuF7yzz5TbnlOqO.HKa"
                }
              }
            ]
          }
        }
      };

      describe('4.1.4.1 Permission to see <user> record in detail panel - allowed', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;
        it(`${n++}. click on: <user>`, async function() {
          props = {
            buttonId: 'MainPanel-listItem-button-user',
            visibleIds: [
              'UserEnhancedTable-tableBody',
              'UserEnhancedTableToolbar-button-add',
              'UserEnhancedTableToolbar-button-import',
              'UserEnhancedTableToolbar-button-downloadOptions',
              'UserEnhancedTable-row-iconButton-detail-1',
              'UserEnhancedTable-row-iconButton-detail-2',
              'UserEnhancedTable-row-iconButton-detail-3',
              'UserEnhancedTable-row-iconButton-detail-4',
              'UserEnhancedTable-row-iconButton-detail-5',
              'UserEnhancedTable-row-iconButton-edit-1',
              'UserEnhancedTable-row-iconButton-edit-2',
              'UserEnhancedTable-row-iconButton-edit-3',
              'UserEnhancedTable-row-iconButton-edit-4',
              'UserEnhancedTable-row-iconButton-edit-5',
              'UserEnhancedTable-row-iconButton-delete-1',
              'UserEnhancedTable-row-iconButton-delete-2',
              'UserEnhancedTable-row-iconButton-delete-3',
              'UserEnhancedTable-row-iconButton-delete-4',
              'UserEnhancedTable-row-iconButton-delete-5',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 2,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=UserEnhancedTable-tableBody] > tr', items => items.length);
          expect(datas).to.include.deep.members([q1, q2]);
          expect(recordsCount).to.eql(5);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: detail icon - <user> record-1`, async function() {
          props = {
            buttonId: 'UserEnhancedTable-row-iconButton-detail-1',
            visibleIds: [
              'UserDetailPanel-button-edit',
              'UserDetailPanel-button-delete',
              'UserDetailPanel-button-close',
              'UserAttributesFormView-div-root',
              'UserAssociationsPage-div-root',
              'RolesCompactView-listA-listItem-label-1',
              'RolesCompactView-listA-listItem-label-2',
              'RolesCompactView-listA-listItem-label-3',
              'RolesCompactView-listA-listItem-label-4',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas).to.include.deep.members([q3]);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close icon`, async function() {
          props = {
            buttonId: 'UserDetailPanel-button-close',
            hiddenIds: [
              'UserDetailPanel-button-edit',
              'UserDetailPanel-button-delete',
              'UserDetailPanel-button-close',
              'UserAttributesFormView-div-root',
              'UserAssociationsPage-div-root',
              'RolesCompactView-listA-listItem-label-1',
              'RolesCompactView-listA-listItem-label-2',
              'RolesCompactView-listA-listItem-label-3',
              'RolesCompactView-listA-listItem-label-4',
            ],
            visibleIds: [
              'UserEnhancedTable-tableBody',
              'UserEnhancedTableToolbar-button-add',
              'UserEnhancedTableToolbar-button-import',
              'UserEnhancedTableToolbar-button-downloadOptions',
              'UserEnhancedTable-row-iconButton-detail-1',
              'UserEnhancedTable-row-iconButton-detail-2',
              'UserEnhancedTable-row-iconButton-detail-3',
              'UserEnhancedTable-row-iconButton-detail-4',
              'UserEnhancedTable-row-iconButton-detail-5',
              'UserEnhancedTable-row-iconButton-edit-1',
              'UserEnhancedTable-row-iconButton-edit-2',
              'UserEnhancedTable-row-iconButton-edit-3',
              'UserEnhancedTable-row-iconButton-edit-4',
              'UserEnhancedTable-row-iconButton-edit-5',
              'UserEnhancedTable-row-iconButton-delete-1',
              'UserEnhancedTable-row-iconButton-delete-2',
              'UserEnhancedTable-row-iconButton-delete-3',
              'UserEnhancedTable-row-iconButton-delete-4',
              'UserEnhancedTable-row-iconButton-delete-5',
            ],
          };
          await clickOn(props);
          // evaluate
          expect(await page.title()).to.eql('Zendro');
        });
      });

      describe('4.1.4.2 Permission to add <user> record in create panel - allowed', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: add icon - <user>`, async function() {
          props = {
            buttonId: 'UserEnhancedTableToolbar-button-add',
            visibleIds: [
              'UserCreatePanel-tabsA-button-attributes',
              'UserCreatePanel-tabsA-button-associations',
              'UserCreatePanel-fabButton-save',
              'UserCreatePanel-button-cancel',
              'UserAttributesFormView-div-root',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - email`, async function () {
          await page.click("[id=StringField-User-email]");
          await page.type("[id=StringField-User-email]", 'user1@zen.dro');
        });

        it(`${n++}. type on: input field - password`, async function () {
          await page.click("[id=PasswordField-User-password]");
          await page.type("[id=PasswordField-User-password]", 'user1');
        });

        it(`${n++}. click on: associations tab`, async function() {
          props = {
            buttonId: 'UserCreatePanel-tabsA-button-associations',
            visibleIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToAddTransferView-div-noItemsB',
              'RolesToAddTransferView-listA-listItem-1',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToAddTransferView-listA-listItem-1-button-add',
              'RolesToAddTransferView-listA-listItem-2-button-add',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'UserCreatePanel-fabButton-save',
              'UserCreatePanel-button-cancel',
            ],
            hiddenId: 'UserAttributesFormView-div-root',
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 2,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=RolesToAddTransferView-list-listA] > li', items => items.length);
          expect(datas).to.include.deep.members([q4, q5]);
          expect(recordsCount).to.eql(4);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: add association - <role> record-1`, async function() {
          props = {
            buttonId: 'RolesToAddTransferView-listA-listItem-1-button-add',
            visibleIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToAddTransferView-list-listB',
              'RolesToAddTransferView-listB-listItem-1',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToAddTransferView-listB-listItem-1-button-remove',
              'RolesToAddTransferView-listA-listItem-2-button-add',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'UserCreatePanel-fabButton-save',
              'UserCreatePanel-button-cancel',
            ],
            hiddenIds: [
              'RolesToAddTransferView-div-noItemsB',
              'RolesToAddTransferView-listA-listItem-1',
              'RolesToAddTransferView-listA-listItem-1-button-add',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 4,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCountA = await page.$$eval('[id=RolesToAddTransferView-list-listA] > li', items => items.length);
          let recordsCountB = await page.$$eval('[id=RolesToAddTransferView-list-listB] > li', items => items.length);
          expect(datas).to.include.deep.members([q6, q7, q8, q9]);
          expect(recordsCountA).to.eql(3);
          expect(recordsCountB).to.eql(1);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: save record <user>`, async function() {
          props = {
            buttonId: 'UserCreatePanel-fabButton-save',
            visibleIds: [
              'UserEnhancedTable-tableBody',
              'UserEnhancedTableToolbar-button-add',
              'UserEnhancedTableToolbar-button-import',
              'UserEnhancedTableToolbar-button-downloadOptions',
              'UserEnhancedTable-row-iconButton-detail-1',
              'UserEnhancedTable-row-iconButton-detail-2',
              'UserEnhancedTable-row-iconButton-detail-3',
              'UserEnhancedTable-row-iconButton-detail-4',
              'UserEnhancedTable-row-iconButton-detail-5',
              'UserEnhancedTable-row-iconButton-detail-6',
              'UserEnhancedTable-row-iconButton-edit-1',
              'UserEnhancedTable-row-iconButton-edit-2',
              'UserEnhancedTable-row-iconButton-edit-3',
              'UserEnhancedTable-row-iconButton-edit-4',
              'UserEnhancedTable-row-iconButton-edit-5',
              'UserEnhancedTable-row-iconButton-edit-6',
              'UserEnhancedTable-row-iconButton-delete-1',
              'UserEnhancedTable-row-iconButton-delete-2',
              'UserEnhancedTable-row-iconButton-delete-3',
              'UserEnhancedTable-row-iconButton-delete-4',
              'UserEnhancedTable-row-iconButton-delete-5',
              'UserEnhancedTable-row-iconButton-delete-6',
            ],
            hiddenIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToAddTransferView-list-listB',
              'RolesToAddTransferView-listB-listItem-1',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToAddTransferView-listB-listItem-1-button-remove',
              'RolesToAddTransferView-listA-listItem-2-button-add',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'UserCreatePanel-fabButton-save',
              'UserCreatePanel-button-cancel',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 3,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=UserEnhancedTable-tableBody] > tr', items => items.length);
          let addUser = datas.reduce((a, c) => {if(c&&c.data&&c.data.addUser){ a=c.data.addUser; return a; } else  {return a; }}, {});
          let usersConnection = datas.reduce((a, c) => {if(c&&c.data&&c.data.usersConnection){ a=c.data.usersConnection; return a; } else  {return a; }}, {});
          q10.data.addUser.password = addUser.password;
          q12.data.usersConnection.edges.push({node: addUser});
          q12.data.usersConnection.pageInfo.endCursor = usersConnection.pageInfo.endCursor;
          expect(datas).to.include.deep.members([q10, q11, q12]);
          expect(recordsCount).to.eql(6);
          expect(await page.title()).to.eql('Zendro');
        });
      });

      describe('4.1.4.3 Permission to edit <user> record in update panel - allowed', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: edit icon - <user> - record-6`, async function() {
          props = {
            buttonId: 'UserEnhancedTable-row-iconButton-edit-6',
            visibleIds: [
              'UserAttributesFormView-div-root',
              'UserUpdatePanel-tabsA-button-attributes',
              'UserUpdatePanel-tabsA-button-associations',
              'UserUpdatePanel-fabButton-save',
              'UserUpdatePanel-button-cancel',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - email`, async function () {
          await page.click("[id=StringField-User-email]", { clickCount: 3 });
          await page.type("[id=StringField-User-email]", 'user1_edited@zen.dro');
        });

        it(`${n++}. click on: associations tab`, async function() {
          props = {
            buttonId: 'UserUpdatePanel-tabsA-button-associations',
            visibleIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToRemoveTransferView-list-listA',
              'RolesToRemoveTransferView-listA-listItem-1',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToRemoveTransferView-listA-listItem-1-button-remove',
              'RolesToAddTransferView-listA-listItem-2-button-add',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'RolesToAddTransferView-div-noItemsB',
              'RolesToRemoveTransferView-div-noItemsB',
              'UserUpdatePanel-fabButton-save',
              'UserUpdatePanel-button-cancel',
            ],
            
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 4,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCountA = await page.$$eval('[id=RolesToAddTransferView-list-listA] > li', items => items.length);
          let recordsCountB = await page.$$eval('[id=RolesToRemoveTransferView-list-listA] > li', items => items.length);
          expect(datas).to.include.deep.members([q13, q14, q15, q16]);
          expect(recordsCountA).to.eql(3);
          expect(recordsCountB).to.eql(1);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: add association - <role> record-2`, async function() {
          props = {
            buttonId: 'RolesToAddTransferView-listA-listItem-2-button-add',
            visibleIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToAddTransferView-list-listB',
              'RolesToRemoveTransferView-list-listA',
              'RolesToRemoveTransferView-listA-listItem-1',
              'RolesToAddTransferView-listB-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToRemoveTransferView-listA-listItem-1-button-remove',
              'RolesToAddTransferView-listB-listItem-2-button-remove',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'RolesToRemoveTransferView-div-noItemsB',
              'UserUpdatePanel-fabButton-save',
              'UserUpdatePanel-button-cancel',
            ],
            hiddenIds: [
              'RolesToAddTransferView-div-noItemsB',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-2-button-add',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 5,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCountA = await page.$$eval('[id=RolesToAddTransferView-list-listA] > li', items => items.length);
          let recordsCountB = await page.$$eval('[id=RolesToAddTransferView-list-listB] > li', items => items.length);
          let recordsCountC = await page.$$eval('[id=RolesToRemoveTransferView-list-listA] > li', items => items.length);
          expect(datas).to.include.deep.members([q17, q18, q19, q20, q21]);
          expect(recordsCountA).to.eql(2);
          expect(recordsCountB).to.eql(1);
          expect(recordsCountC).to.eql(1);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: save record <user>`, async function() {
          props = {
            buttonId: 'UserUpdatePanel-fabButton-save',
            visibleIds: [
              'UserEnhancedTable-tableBody',
              'UserEnhancedTableToolbar-button-add',
              'UserEnhancedTableToolbar-button-import',
              'UserEnhancedTableToolbar-button-downloadOptions',
              'UserEnhancedTable-row-iconButton-detail-1',
              'UserEnhancedTable-row-iconButton-detail-2',
              'UserEnhancedTable-row-iconButton-detail-3',
              'UserEnhancedTable-row-iconButton-detail-4',
              'UserEnhancedTable-row-iconButton-detail-5',
              'UserEnhancedTable-row-iconButton-detail-6',
              'UserEnhancedTable-row-iconButton-edit-1',
              'UserEnhancedTable-row-iconButton-edit-2',
              'UserEnhancedTable-row-iconButton-edit-3',
              'UserEnhancedTable-row-iconButton-edit-4',
              'UserEnhancedTable-row-iconButton-edit-5',
              'UserEnhancedTable-row-iconButton-edit-6',
              'UserEnhancedTable-row-iconButton-delete-1',
              'UserEnhancedTable-row-iconButton-delete-2',
              'UserEnhancedTable-row-iconButton-delete-3',
              'UserEnhancedTable-row-iconButton-delete-4',
              'UserEnhancedTable-row-iconButton-delete-5',
              'UserEnhancedTable-row-iconButton-delete-6',
            ],
            hiddenIds: [
              'RolesTransferLists-div-root',
              'RolesToAddTransferView-list-listA',
              'RolesToAddTransferView-list-listB',
              'RolesToAddTransferView-listB-listItem-1',
              'RolesToAddTransferView-listA-listItem-2',
              'RolesToAddTransferView-listA-listItem-3',
              'RolesToAddTransferView-listA-listItem-4',
              'RolesToAddTransferView-listB-listItem-1-button-remove',
              'RolesToAddTransferView-listA-listItem-2-button-add',
              'RolesToAddTransferView-listA-listItem-3-button-add',
              'RolesToAddTransferView-listA-listItem-4-button-add',
              'UserUpdatePanel-fabButton-save',
              'UserUpdatePanel-button-cancel',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 3,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=UserEnhancedTable-tableBody] > tr', items => items.length);
          let updateUser = datas.reduce((a, c) => {if(c&&c.data&&c.data.updateUser){ a=c.data.updateUser; return a; } else  {return a; }}, {});
          let usersConnection = datas.reduce((a, c) => {if(c&&c.data&&c.data.usersConnection){ a=c.data.usersConnection; return a; } else  {return a; }}, {});
          q22.data.updateUser.password = updateUser.password;
          q24.data.usersConnection.edges.push({node: updateUser});
          q24.data.usersConnection.pageInfo.endCursor = usersConnection.pageInfo.endCursor;
          expect(datas).to.include.deep.members([q22, q23, q24]);
          expect(recordsCount).to.eql(6);
          expect(await page.title()).to.eql('Zendro');
        });
      });

      describe('4.1.4.4 Permission to remove <user> record in delete panel - allowed', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: edit icon - <user> - record-6`, async function() {
          props = {
            buttonId: 'UserEnhancedTable-row-iconButton-delete-6',
            visibleIds: [
              'UserAttributesFormView-div-root',
              'UserAssociationsPage-div-root',
              'UserDeleteConfirmationDialog-button-accept',
              'UserDeleteConfirmationDialog-button-reject',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas).to.include.deep.members([q25]);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: delete confirmation button`, async function() {
          props = {
            buttonId: 'UserDeleteConfirmationDialog-button-accept',
            visibleIds: [
              'UserEnhancedTable-tableBody',
              'UserEnhancedTableToolbar-button-add',
              'UserEnhancedTableToolbar-button-import',
              'UserEnhancedTableToolbar-button-downloadOptions',
              'UserEnhancedTable-row-iconButton-detail-1',
              'UserEnhancedTable-row-iconButton-detail-2',
              'UserEnhancedTable-row-iconButton-detail-3',
              'UserEnhancedTable-row-iconButton-detail-4',
              'UserEnhancedTable-row-iconButton-detail-5',
              'UserEnhancedTable-row-iconButton-edit-1',
              'UserEnhancedTable-row-iconButton-edit-2',
              'UserEnhancedTable-row-iconButton-edit-3',
              'UserEnhancedTable-row-iconButton-edit-4',
              'UserEnhancedTable-row-iconButton-edit-5',
              'UserEnhancedTable-row-iconButton-delete-1',
              'UserEnhancedTable-row-iconButton-delete-2',
              'UserEnhancedTable-row-iconButton-delete-3',
              'UserEnhancedTable-row-iconButton-delete-4',
              'UserEnhancedTable-row-iconButton-delete-5',
            ],
            hiddenIds: [
              'UserAttributesFormView-div-root',
              'UserAssociationsPage-div-root',
              'UserDeleteConfirmationDialog-button-accept',
              'UserDeleteConfirmationDialog-button-reject',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 3,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=UserEnhancedTable-tableBody] > tr', items => items.length);
          expect(datas).to.include.deep.members([q26, q27, q28]);
          expect(recordsCount).to.eql(5);
          expect(await page.title()).to.eql('Zendro');
        });
      });
    });
  });

  describe('4.2. Role - acl_validations-role', function() {
    describe('4.2.1 Login', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: logout`, async function() {
        props = {
          buttonId: 'MainPanel-button-logout',
          visibleId: 'LoginPage-div-root',
        };
        await clickOn(props);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. type on: input field - email`, async function () {
        await page.click("input[id=LoginPage-textField-email]");
        await page.type("input[id=LoginPage-textField-email]", 'uacl_validations@zen.dro');
      });

      it(`${n++}. type on: input field - password`, async function () {
        await page.click("input[id=LoginPage-textField-password]");
        await page.type("input[id=LoginPage-textField-password]", 'admin');
      });

      it(`${n++}. login: with uacl_validations@zen.dro user`, async function() {
        props = {
          buttonId: 'LoginPage-button-login',
          visibleId: 'MainPanel-div-root',
          hiddenId: 'LoginPage-div-root',
        };
        await clickOn(props);
        //evaluate
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.2.2 Main menu - just <acl_validations> model displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: collapse models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleId: 'MainPanel-listItem-icon-models-expandMore',
          hiddenId: 'MainPanel-collapse-models',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: expand models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleIds: [
            'MainPanel-listItem-icon-models-expandLess',
            'MainPanel-collapse-models',
          ],
          hiddenId: 'MainPanel-listItem-icon-models-expandMore',
        };
        await clickOn(props);
        // evaluate
        let modelsItemsContent = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.map(item=>item.textContent));
        let modelsCount = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.length);
        expect(modelsItemsContent).to.have.deep.members(['Acl_validations']);
        expect(modelsCount).to.eql(1);
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.2.3 Main menu - no admin models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. check: no admin expander listItem`, async function() {
        await page.waitForSelector(`[id=MainPanel-listItem-button-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=MainPanel-listItem-icon-admin-expandMore]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=collapse-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
      });
    });

    describe('4.2.4 CRUD permission in <acl_validations> model - allowed in spa - not allowed in graphql-server', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      let q1 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 1,
                "column": 3
              }
            ],
            "path": [
              "countAcl_validations"
            ]
          }
        ],
        "data": {
          "countAcl_validations": null
        }
      };
      let q2 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 4,
                "column": 15
              }
            ],
            "path": [
              "addAcl_validations"
            ]
          }
        ],
        "data": null
      };

      describe('4.2.4.1 Permission to see <acl_validations> table - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;
        it(`${n++}. click on: <acl_validations>`, async function() {
          props = {
            buttonId: 'MainPanel-listItem-button-acl_validations',
            visibleIds: [
              'AclValidationsEnhancedTable-box-noData',
              'AclValidationsEnhancedTableToolbar-button-add',
              'AclValidationsEnhancedTableToolbar-button-import',
              'AclValidationsEnhancedTableToolbar-button-downloadOptions',
              'Snackbar-card',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q1.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q1.errors[0].path);
          expect(datas[0].data).to.eql(q1.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });
      });

      describe('4.2.4.2 Permission to add <acl_validations> record in create panel - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: add icon - <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTableToolbar-button-add',
            visibleIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - string_1`, async function () {
          await page.click("[id=StringField-AclValidations-string_1]");
          await page.type("[id=StringField-AclValidations-string_1]", 'string_1');
        });

        it(`${n++}. click on: save record <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsCreatePanel-fabButton-save',
            visibleIds: [
              'Snackbar-card',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q2.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q2.errors[0].path);
          expect(datas[0].data).to.eql(q2.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close <acl_validations> create panel`, async function () {
          props = {
            buttonId: 'AclValidationsCreatePanel-button-cancel',
            visibleIds: [
              'AclValidationsConfirmationDialog-create',
              'AclValidationsConfirmationDialog-create-button-accept',
              'AclValidationsConfirmationDialog-create-button-reject',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close confirmation button`, async function () {
          props = {
            buttonId: 'AclValidationsConfirmationDialog-create-button-accept',
            hiddenIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsConfirmationDialog-create',
              'AclValidationsConfirmationDialog-create-button-accept',
              'AclValidationsConfirmationDialog-create-button-reject',
            ],
          };
          await clickOn(props);
        });
      });
    });
  });

  describe('4.3. Role - editor + acl_validations-role', function() {
    describe('4.3.1 Login', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: logout`, async function() {
        props = {
          buttonId: 'MainPanel-button-logout',
          visibleId: 'LoginPage-div-root',
        };
        await clickOn(props);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. type on: input field - email`, async function () {
        await page.click("input[id=LoginPage-textField-email]");
        await page.type("input[id=LoginPage-textField-email]", 'ueditor@zen.dro');
      });

      it(`${n++}. type on: input field - password`, async function () {
        await page.click("input[id=LoginPage-textField-password]");
        await page.type("input[id=LoginPage-textField-password]", 'admin');
      });

      it(`${n++}. login: with ueditor@zen.dro user`, async function() {
        props = {
          buttonId: 'LoginPage-button-login',
          visibleId: 'MainPanel-div-root',
          hiddenId: 'LoginPage-div-root',
        };
        await clickOn(props);
        //evaluate
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.2.2 Main menu - just <acl_validations> model displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: collapse models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleId: 'MainPanel-listItem-icon-models-expandMore',
          hiddenId: 'MainPanel-collapse-models',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: expand models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleIds: [
            'MainPanel-listItem-icon-models-expandLess',
            'MainPanel-collapse-models',
          ],
          hiddenId: 'MainPanel-listItem-icon-models-expandMore',
        };
        await clickOn(props);
        // evaluate
        let modelsItemsContent = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.map(item=>item.textContent));
        let modelsCount = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.length);
        expect(modelsItemsContent).to.have.deep.members(['Acl_validations']);
        expect(modelsCount).to.eql(1);
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.2.3 Main menu - no admin models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. check: no admin expander listItem`, async function() {
        await page.waitForSelector(`[id=MainPanel-listItem-button-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=MainPanel-listItem-icon-admin-expandMore]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=collapse-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
      });
    });

    describe('4.2.4 CRUD permission in <acl_validations> model - allowed in spa - not allowed in graphql-server', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      let q1 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 1,
                "column": 3
              }
            ],
            "path": [
              "countAcl_validations"
            ]
          }
        ],
        "data": {
          "countAcl_validations": null
        }
      };
      let q2 = {
        "data": {
          "addAcl_validations": {
            "id": "1",
            "string_1": "string_1"
          }
        }
      };

      describe('4.2.4.1 Permission to see <acl_validations> table - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;
        it(`${n++}. click on: <acl_validations>`, async function() {
          props = {
            buttonId: 'MainPanel-listItem-button-acl_validations',
            visibleIds: [
              'AclValidationsEnhancedTable-box-noData',
              'AclValidationsEnhancedTableToolbar-button-add',
              'AclValidationsEnhancedTableToolbar-button-import',
              'AclValidationsEnhancedTableToolbar-button-downloadOptions',
              'Snackbar-card',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q1.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q1.errors[0].path);
          expect(datas[0].data).to.eql(q1.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });
      });

      describe('4.2.4.2 Permission to add <acl_validations> record in create panel - allowed by spa & graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: add icon - <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTableToolbar-button-add',
            visibleIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - string_1`, async function () {
          await page.click("[id=StringField-AclValidations-string_1]");
          await page.type("[id=StringField-AclValidations-string_1]", 'string_1');
        });

        it(`${n++}. click on: save record <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsCreatePanel-fabButton-save',
            visibleIds: [
              'AclValidationsEnhancedTable-box-noData',
              'AclValidationsEnhancedTableToolbar-button-add',
              'AclValidationsEnhancedTableToolbar-button-import',
              'AclValidationsEnhancedTableToolbar-button-downloadOptions',
              'Snackbar-card',
            ],
            hiddenIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 2,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let addAcl_validations = datas.reduce((a, c) => {if(c&&c.data&&c.data.addAcl_validations){ a=c.data.addAcl_validations; return a; } else  {return a; }}, {});
          let qerror = datas.reduce((a, c) => {if(c&&c.errors){ a={...c}; return a; } else  {return a; }}, {});
          q2.data.addAcl_validations.id = addAcl_validations.id;
          expect(q2.data.addAcl_validations).to.eql(addAcl_validations);
          expect(qerror.errors[0].message).to.eql(q1.errors[0].message);
          expect(qerror.errors[0].path).to.eql(q1.errors[0].path);
          expect(qerror.data).to.eql(q1.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });
      });
    });
  });

  describe('4.3. Role - reader + acl_validations-role', function() {
    describe('4.3.1 Login', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. click on: logout`, async function() {
        props = {
          buttonId: 'MainPanel-button-logout',
          visibleId: 'LoginPage-div-root',
        };
        await clickOn(props);
        expect(await page.title()).to.eql('Zendro');
      });

      it(`${n++}. type on: input field - email`, async function () {
        await page.click("input[id=LoginPage-textField-email]");
        await page.type("input[id=LoginPage-textField-email]", 'ureader@zen.dro');
      });

      it(`${n++}. type on: input field - password`, async function () {
        await page.click("input[id=LoginPage-textField-password]");
        await page.type("input[id=LoginPage-textField-password]", 'admin');
      });

      it(`${n++}. login: with ureader@zen.dro user`, async function() {
        props = {
          buttonId: 'LoginPage-button-login',
          visibleId: 'MainPanel-div-root',
          hiddenId: 'LoginPage-div-root',
        };
        await clickOn(props);
        //evaluate
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.3.2 Main menu - all regular models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      let modelsTitles = [
        'Accession',            'Acl_validations',
        'Aminoacidsequence',    'Capital',
        'Country',              'Country_to_river',
        'Cultivar',             'Dog',
        'Field_plot',           'Individual',
        'Location',             'Measurement',
        'Microbiome_asv',       'Parrot',
        'Person',               'Plant_measurement',
        'Pot',                  'River',
        'Sample',               'Sample_measurement',
        'SequencingExperiment', 'Taxon',
        'Transcript_count',     'With_validations'
      ];

      it(`${n++}. click on: collapse models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleId: 'MainPanel-listItem-icon-models-expandMore',
          hiddenId: 'MainPanel-collapse-models',
        };
        await clickOn(props);
      });

      it(`${n++}. click on: expand models`, async function() {
        props = {
          buttonId: 'MainPanel-listItem-button-models',
          visibleIds: [
            'MainPanel-listItem-icon-models-expandLess',
            'MainPanel-collapse-models',
          ],
          hiddenId: 'MainPanel-listItem-icon-models-expandMore',
        };
        await clickOn(props);
        // evaluate
        let modelsItemsContent = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.map(item=>item.textContent));
        let modelsCount = await page.$$eval('[id=MainPanel-collapse-list-models] > div[role=button]', items => items.length);
        expect(modelsItemsContent).to.have.deep.members(modelsTitles);
        expect(modelsCount).to.eql(modelsTitles.length);
        expect(await page.title()).to.eql('Zendro');
      });
    });

    describe('4.3.3 Main menu - no admin models displayed', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      it(`${n++}. check: no admin expander listItem`, async function() {
        await page.waitForSelector(`[id=MainPanel-listItem-button-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=MainPanel-listItem-icon-admin-expandMore]`,{ hidden: true }).then(a=>a, r=>{throw r});
        await page.waitForSelector(`[id=collapse-admin]`,{ hidden: true }).then(a=>a, r=>{throw r});
      });
    });

    describe('4.3.4 CRUD permission in <acl_validations> model - allowed in spa - not allowed in graphql-server', function() {
      //general timeout for each 'it'.
      this.timeout(tt); //10s.
      let n=1;

      let modelsNames = [
        'Accession', 
      ]

      let q1 = {
        "data": {
          "countAcl_validations": 1
        }
      };
      let q2 = {
        "data": {
          "acl_validationsConnection": {
            "pageInfo": {
              "startCursor": "eyJzdHJpbmdfMSI6InN0cmluZ18xIiwiaWQiOjF9",
              "endCursor": "eyJzdHJpbmdfMSI6InN0cmluZ18xIiwiaWQiOjF9",
              "hasPreviousPage": false,
              "hasNextPage": false
            },
            "edges": [
              {
                "node": {
                  "id": "1",
                  "string_1": "string_1"
                }
              }
            ]
          }
        }
      };
      let q3 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 4,
                "column": 15
              }
            ],
            "path": [
              "addAcl_validations"
            ]
          }
        ],
        "data": null
      };
      let q4 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 5,
                "column": 15
              }
            ],
            "path": [
              "updateAcl_validations"
            ]
          }
        ],
        "data": null
      };
      let q5 = {
        "errors": [
          {
            "message": "You don't have authorization to perform this action",
            "locations": [
              {
                "line": 5,
                "column": 11
              }
            ],
            "path": [
              "deleteAcl_validations"
            ]
          }
        ],
        "data": null
      };

      describe('4.3.4.1 Permission to see <acl_validations> table - allowed by spa & graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;
        it(`${n++}. click on: <acl_validations>`, async function() {
          props = {
            buttonId: 'MainPanel-listItem-button-acl_validations',
            visibleIds: [
              'AclValidationsEnhancedTable-tableBody',
              'AclValidationsEnhancedTableToolbar-button-add',
              'AclValidationsEnhancedTableToolbar-button-import',
              'AclValidationsEnhancedTableToolbar-button-downloadOptions',
              'AclValidationsEnhancedTable-row-iconButton-detail-1',
              'AclValidationsEnhancedTable-row-iconButton-edit-1',
              'AclValidationsEnhancedTable-row-iconButton-delete-1',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 2,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          let recordsCount = await page.$$eval('[id=AclValidationsEnhancedTable-tableBody] > tr', items => items.length);
          expect(datas).to.include.deep.members([q1, q2]);
          expect(recordsCount).to.eql(1);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: detail icon - <acl_validations> record-1`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTable-row-iconButton-detail-1',
            visibleIds: [
              'AclValidationsDetailPanel-button-edit',
              'AclValidationsDetailPanel-button-delete',
              'AclValidationsDetailPanel-button-close',
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsAssociationsPage-div-root',
              'AclValidationsUpdatePanel-tabsA-button-noAssociations',
            ],
          };
          await clickOn(props);
          // evaluate
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close icon`, async function() {
          props = {
            buttonId: 'AclValidationsDetailPanel-button-close',
            hiddenIds: [
              'AclValidationsDetailPanel-button-edit',
              'AclValidationsDetailPanel-button-delete',
              'AclValidationsDetailPanel-button-close',
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsAssociationsPage-div-root',
              'AclValidationsUpdatePanel-tabsA-button-noAssociations',
            ],
            visibleIds: [
              'AclValidationsEnhancedTable-tableBody',
              'AclValidationsEnhancedTableToolbar-button-add',
              'AclValidationsEnhancedTableToolbar-button-import',
              'AclValidationsEnhancedTableToolbar-button-downloadOptions',
              'AclValidationsEnhancedTable-row-iconButton-detail-1',
              'AclValidationsEnhancedTable-row-iconButton-edit-1',
              'AclValidationsEnhancedTable-row-iconButton-delete-1',
            ],
          };
          await clickOn(props);
          // evaluate
          expect(await page.title()).to.eql('Zendro');
        });
      });

      describe('4.3.4.2 Permission to add <acl_validations> record in create panel - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: add icon - <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTableToolbar-button-add',
            visibleIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - string_1`, async function () {
          await page.click("[id=StringField-AclValidations-string_1]");
          await page.type("[id=StringField-AclValidations-string_1]", 'string_1');
        });

        it(`${n++}. click on: save record <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsCreatePanel-fabButton-save',
            visibleIds: [
              'Snackbar-card',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q3.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q3.errors[0].path);
          expect(datas[0].data).to.eql(q3.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close <acl_validations> create panel`, async function () {
          props = {
            buttonId: 'AclValidationsCreatePanel-button-cancel',
            visibleIds: [
              'AclValidationsConfirmationDialog-create',
              'AclValidationsConfirmationDialog-create-button-accept',
              'AclValidationsConfirmationDialog-create-button-reject',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close confirmation button`, async function () {
          props = {
            buttonId: 'AclValidationsConfirmationDialog-create-button-accept',
            hiddenIds: [
              'AclValidationsCreatePanel-tabsA-button-attributes',
              'AclValidationsCreatePanel-tabsA-button-associations',
              'AclValidationsCreatePanel-fabButton-save',
              'AclValidationsCreatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsConfirmationDialog-create',
              'AclValidationsConfirmationDialog-create-button-accept',
              'AclValidationsConfirmationDialog-create-button-reject',
            ],
          };
          await clickOn(props);
        });
      });

      describe('4.3.4.3 Permission to update <acl_validations> record in update panel - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: update icon - <acl_validations> - record-1`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTable-row-iconButton-edit-1',
            visibleIds: [
              'AclValidationsUpdatePanel-tabsA-button-attributes',
              'AclValidationsUpdatePanel-tabsA-button-associations',
              'AclValidationsUpdatePanel-fabButton-save',
              'AclValidationsUpdatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. type on: input field - string_1`, async function () {
          await page.click("[id=StringField-AclValidations-string_1]", { clickCount: 3 });
          await page.type("[id=StringField-AclValidations-string_1]", 'string_1_edited');
        });

        it(`${n++}. click on: save record <acl_validations>`, async function() {
          props = {
            buttonId: 'AclValidationsUpdatePanel-fabButton-save',
            visibleIds: [
              'Snackbar-card',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q4.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q4.errors[0].path);
          expect(datas[0].data).to.eql(q4.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close <acl_validations> update panel`, async function () {
          props = {
            buttonId: 'AclValidationsUpdatePanel-button-cancel',
            visibleIds: [
              'AclValidationsConfirmationDialog-update',
              'AclValidationsConfirmationDialog-update-button-accept',
              'AclValidationsConfirmationDialog-update-button-reject',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. click on: close confirmation button`, async function () {
          props = {
            buttonId: 'AclValidationsConfirmationDialog-update-button-accept',
            hiddenIds: [
              'AclValidationsUpdatePanel-tabsA-button-attributes',
              'AclValidationsUpdatePanel-tabsA-button-associations',
              'AclValidationsUpdatePanel-fabButton-save',
              'AclValidationsUpdatePanel-button-cancel',
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsConfirmationDialog-update',
              'AclValidationsConfirmationDialog-update-button-accept',
              'AclValidationsConfirmationDialog-update-button-reject',
            ],
          };
          await clickOn(props);
        });
      });

      describe('4.3.4.4 Permission to delete <acl_validations> record in delete panel - not allowed by graphql-server', function() {
        //general timeout for each 'it'.
        this.timeout(tt); //10s.
        let n=1;

        it(`${n++}. click on: delete icon - <acl_validations> - record-1`, async function() {
          props = {
            buttonId: 'AclValidationsEnhancedTable-row-iconButton-delete-1',
            visibleIds: [
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsAssociationsPage-div-root',
              'AclValidationsUpdatePanel-tabsA-button-noAssociations',
              'AclValidationsDeleteConfirmationDialog-button-reject',
              'AclValidationsDeleteConfirmationDialog-button-accept',
            ],
          };
          await clickOn(props);
        });

        it(`${n++}. click on: confirm deletion of <acl_validations> - record-1`, async function() {
          props = {
            buttonId: 'AclValidationsDeleteConfirmationDialog-button-accept',
            visibleIds: [
              'Snackbar-card',
            ],
            hiddenIds: [
              'AclValidationsAttributesFormView-div-root',
              'AclValidationsAssociationsPage-div-root',
              'AclValidationsUpdatePanel-tabsA-button-noAssociations',
              'AclValidationsDeleteConfirmationDialog-button-reject',
              'AclValidationsDeleteConfirmationDialog-button-accept',
            ],
            requests: ['http://localhost:3000/graphql'],
            responses: [],
            expectedResponses: 1,
          };
          await clickOn(props);
          // evaluate
          let datas = (await Promise.all(props.responses).then(a=>a, r=>{throw r})).map((data) => data);
          expect(datas.length).to.eql(1);
          expect(datas[0].errors[0].message).to.eql(q5.errors[0].message);
          expect(datas[0].errors[0].path).to.eql(q5.errors[0].path);
          expect(datas[0].data).to.eql(q5.data);
          expect(await page.title()).to.eql('Zendro');
        });

        it(`${n++}. click on: close <Snackbar>`, async function () {
          props = {
            elementType: 'button',
            buttonId: 'Snackbar-button-close',
            hiddenId: 'Snackbar-card'
          };
          await clickOn(props);
        });
      });
    });
  });
});

/**
 * Utils
 */
async function clickOn(props) {
  //set delay timeout
  let lttdelay = (props.ttdelay) ? props.ttdelay : ttdelay;
  
  //set button elementType
  let elementType = props.elementType ? props.elementType : '';

  //set waitEvents array
  let waitEvents = [];

  //set visible elements
  if(props.visibleId){
    waitEvents.push(page.waitForSelector(`[id=${props.visibleId}]`,{ visible: true }).then(a=>a, r=>{throw r}));
  }  
  if(props.visibleIds) {
    for(let i=0; i<props.visibleIds.length; i++) {
      waitEvents.push(page.waitForSelector(`[id=${props.visibleIds[i]}]`,{ visible: true }).then(a=>a, r=>{throw r}));
    }
  }

  //set hidden elements
  if(props.hiddenId) {
    waitEvents.push(page.waitForSelector(`[id=${props.hiddenId}]`,{ hidden: true }).then(a=>a, r=>{throw r}));
  }
  if(props.hiddenIds) {
    for(let i=0; i<props.hiddenIds.length; i++) {
      waitEvents.push(page.waitForSelector(`[id=${props.hiddenIds[i]}]`,{ hidden: true }).then(a=>a, r=>{throw r}));
    }
  }
  
  //set requests
  if(props.requests && props.expectedResponses) {
    waitEvents.push(
      page.waitForResponse((res) => {
        
        if([200, 500].includes(res.status()) && props.requests.includes(res.url())){
          props.responses.push(res.json().then((data) => data, (r)=>r));
        }
        return(props.responses.length === props.expectedResponses);

      }).then(a=>a, r=>{throw r}));
  }

  //click
  await Promise.all([
    //wait for events
    ...waitEvents,
    //click
    page.click(`${elementType}[id=${props.buttonId}]`).then(a=>a, r=>{throw r}),
  ]).then(a=>a, r=>{throw r});

  //delay
  await delay(lttdelay);
}

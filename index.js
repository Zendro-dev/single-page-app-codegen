#!/usr/bin/env node

// Required packages:
ejs = require('ejs');
inflection = require('inflection');
fs = require('fs-extra');
path = require('path');
jsb = require('js-beautify').js_beautify;
funks = require(path.resolve(__dirname, 'funks.js'));
program = require('commander');
const colors = require('colors/safe');

modelsCreated = require(path.resolve(__dirname, 'modelsNames.js'));


// Parse command-line-arguments and execute:
program
  .description('Code generator for SPA')
  .option('-f, --jsonFiles <filesFolder>', 'Folder containing one json file for each model')
  .option('-o, --outputDirectory <directory>', 'Directory where generated code will be written')
  .option('-v, --verbose', 'Show details about the results of running code generation process')
  .parse(process.argv);
// Do your job:

// Check input JSON files
if(!program.jsonFiles){
  //msg
  console.log(colors.red('! Error: '), 'You must indicate the json files in order to generate the code.');
  process.exit(1);
}

// Output directory
let directory = program.outputDirectory || __dirname;
//msg
console.log('Output base-directory: ', colors.dim(path.resolve(directory)));

// Verbose
let verbose = program.verbose !== undefined ? true : false;
console.log("verbose: ", verbose);

// Check: required directories
let allRequiredDirsExists = true;
let requiredDirs=
  ['src',
    'src/components',
    'src/requests'
  ];
//msg
console.log(colors.white('\n@ Checking required directories on output base-directory...'));
for(var i=0; i<requiredDirs.length; ++i) {
  let dir = path.resolve(directory, requiredDirs[i]);
  if (fs.existsSync(dir)) {
    //msg
    if(verbose) console.log('@@ dir: ', colors.dim(dir), "... ", colors.green('ok') );
  } else {
    allRequiredDirsExists = false;
    //msg
    if(verbose) console.log('@@ dir: ', colors.dim(dir), "... ", colors.red('does not exist') );
  }
}
if(allRequiredDirsExists) {
  //msg
  console.log(colors.white('@ Checking required directories... ', colors.green('done')));
} else {
  //msg
  console.log(colors.red('! Error: '), 'Some required directories does not exists on output base-directory');
  process.exit(1);
}

// Start rendering phase
//msg
console.log(colors.white('\n@ Starting render GUI components for models in: \n', colors.green(path.resolve(directory))));
let promises = []
let totalFiles = 0;
let totalWrongFiles = 0;
fs.readdirSync(program.jsonFiles).forEach( async (json_file) =>{
  totalFiles++;
  let fileData = funks.parseFile(program.jsonFiles + '/'+json_file );
  if(fileData === null) return;
  //msg
  if(verbose) console.log("\n@@ Proccessing model in: ", colors.blue(json_file));
  let check_json_model = funks.checkJsonDataFile(fileData);
  if(!check_json_model.pass){
    totalWrongFiles++;
    check_json_model.errors.forEach( (error) =>{
      console.log(colors.red(error));
    });
    //msg
    if(verbose) console.log(colors.dim("@@@ Cheking json model definition... "), colors.red('error'));
    return;
  } else {
    //msg
    if(verbose) console.log(colors.dim("@@@ Cheking json model definition... "), colors.green('done'));
  }

  let ejbOpts = funks.fillOptionsForViews(fileData);

  /// modelTable ///
  // Create required directories
  let modelTableDirs = [
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/`),
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components`),
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/`),
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components`),
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}DetailPanel/components/${ejbOpts.nameLc}AssociationsPage/`),
    path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}DetailPanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components`),
  ]
  //associations
  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    let assocLc = ejbOpts.sortedAssociations[i].targetModelLc;
    let assocPlLc = ejbOpts.sortedAssociations[i].targetModelPlLc;
    modelTableDirs.push(path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/${assocLc}TransferLists/${assocPlLc}ToAddTransferView/components`));
    modelTableDirs.push(path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${assocLc}TransferLists/${assocPlLc}ToAddTransferView/components`));
    modelTableDirs.push(path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${assocLc}TransferLists/${assocPlLc}ToRemoveTransferView/components`));
    modelTableDirs.push(path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}DetailPanel/components/${ejbOpts.nameLc}AssociationsPage/${assocLc}CompactView/components`));
  }
  //create dirs
  for(var i=0; i<modelTableDirs.length; i++) {
    let dir = modelTableDirs[i];
    if(!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, {recursive: true});
        //msg
        if(verbose) console.log("@@@ dir created: ", colors.dim(dir));
      } catch(e) {
        //err
        console.log(colors.red("! mkdir.error: "), "A problem occured while trying to create a required directory, please ensure you have the sufficient privileges to create directories and that you have a recent version of NodeJS");
        console.log(colors.red("!@ mkdir.error: "), e);
      }
    } else {
      //msg
      if(verbose) console.log("@@@ dir exists: ", colors.dim(dir));
    }
  }

  console.log("ejbOpts: ", ejbOpts);
  //console.log("fileData: ", fileData);

  /**
   * modelTable
   * 
   * */

  // template 1: ModelEnhancedTable
  var fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/`, `${ejbOpts.nameCp}EnhancedTable.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/ModelEnhancedTable', ejbOpts) );

  // template 2: ModelUploadFileDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}UploadFileDialog.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/ModelUploadFileDialog', ejbOpts) );

  // template 3: ModelEnhancedTableToolbar
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}EnhancedTableToolbar.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/ModelEnhancedTableToolbar', ejbOpts) );

  // template 4: ModelEnhancedTableHead
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}EnhancedTableHead.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/ModelEnhancedTableHead', ejbOpts) );

  // template 5: ModelDeleteConfirmationDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}DeleteConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/ModelDeleteConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelCreatePanel 
   * 
   * */

  // template 6: ModelCreatePanel
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/`, `${ejbOpts.nameCp}CreatePanel.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/ModelCreatePanel', ejbOpts) );

  // template 7: ModelTabsA
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/`, `${ejbOpts.nameCp}TabsA.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/ModelTabsA', ejbOpts) );

  // template 8: ModelConfirmationDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/ModelConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelCreatePanel - modelAttributes 
   * 
   * */

  // template 9: ModelAttributesPage
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/ModelAttributesPage', ejbOpts) );

  // template 10: ModelAttributesFormView
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/ModelAttributesFormView', ejbOpts) );

  // template 11: BoolField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `BoolField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/BoolField', ejbOpts) );

  // template 12: DateField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `DateField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/DateField', ejbOpts) );

  // template 13: DateTimeField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `DateTimeField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/DateTimeField', ejbOpts) );

  // template 14: FloatField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `FloatField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/FloatField', ejbOpts) );

  // template 15: IntField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `IntField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/IntField', ejbOpts) );

  // template 16: StringField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `StringField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/StringField', ejbOpts) );

  // template 17: TimeField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `TimeField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAttributesPage/modelAttributesFormView/components/TimeField', ejbOpts) );

  /**
   * modelTable - modelCreatePanel - modelAssociations
   * 
   * */

  // template 18: ModelAssociationsPage
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/`, `${ejbOpts.nameCp}AssociationsPage.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAssociationsPage/ModelAssociationsPage', ejbOpts) );

  // template 19: ModelAssociationsMenuTabs
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAssociationsPage/ModelAssociationsMenuTabs', ejbOpts) );

  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    ejbOpts.aindex = i;

    // template 20: AssociationTransferLists
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/`, `${ejbOpts.sortedAssociations[i].targetModelCp}TransferLists.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAssociationsPage/associationTransferLists/AssociationTransferLists', ejbOpts) );

    // template 21: RecordsToAddTransferView
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToAddTransferView`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToAddTransferView.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAssociationsPage/associationTransferLists/recordsToAddTransferView/RecordsToAddTransferView', ejbOpts) );

    // template 22: RecordsToAddTransferViewToolbar
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToAddTransferView/components`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToAddTransferViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelCreatePanel/components/modelAssociationsPage/associationTransferLists/recordsToAddTransferView/components/RecordsToAddTransferViewToolbar', ejbOpts) );
  
  }

  /**
   * modelTable - modelUpdatePanel 
   * 
   * */

  // template 23: ModelUpdatePanel
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/`, `${ejbOpts.nameCp}UpdatePanel.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/ModelUpdatePanel', ejbOpts) );

  // template 24: ModelTabsA
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/`, `${ejbOpts.nameCp}TabsA.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/ModelTabsA', ejbOpts) );

  // template 25: ModelConfirmationDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/ModelConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelUpdatePanel - modelAttributes 
   * 
   * */

  // template 26: ModelAttributesPage
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/ModelAttributesPage', ejbOpts) );

  // template 27: ModelAttributesFormView
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/ModelAttributesFormView', ejbOpts) );

  // template 28: BoolField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `BoolField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/BoolField', ejbOpts) );

  // template 29: DateField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `DateField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/DateField', ejbOpts) );

  // template 30: DateTimeField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `DateTimeField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/DateTimeField', ejbOpts) );

  // template 31: FloatField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `FloatField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/FloatField', ejbOpts) );

  // template 32: IntField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `IntField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/IntField', ejbOpts) );

  // template 33: StringField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `StringField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/StringField', ejbOpts) );

  // template 34: TimeField
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/components/`, `TimeField.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAttributesPage/modelAttributesFormView/components/TimeField', ejbOpts) );

  /**
   * modelTable - modelUpdatePanel - modelAssociations
   * 
   * */

  // template 35: ModelAssociationsPage
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/`, `${ejbOpts.nameCp}AssociationsPage.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/ModelAssociationsPage', ejbOpts) );

  // template 36: ModelAssociationsMenuTabs
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
  promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/ModelAssociationsMenuTabs', ejbOpts) );

  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    ejbOpts.aindex = i;

    // template 37: AssociationTransferLists
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/`, `${ejbOpts.sortedAssociations[i].targetModelCp}TransferLists.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/associationTransferLists/AssociationTransferLists', ejbOpts) );

    // template 38: RecordsToAddTransferView
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToAddTransferView`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToAddTransferView.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/associationTransferLists/recordsToAddTransferView/RecordsToAddTransferView', ejbOpts) );

    // template 39: RecordsToAddTransferViewToolbar
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToAddTransferView/components`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToAddTransferViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/associationTransferLists/recordsToAddTransferView/components/RecordsToAddTransferViewToolbar', ejbOpts) );

    // template 40: RecordsToRemoveTransferView
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToRemoveTransferView`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToRemoveTransferView.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/associationTransferLists/recordsToRemoveTransferView/RecordsToRemoveTransferView', ejbOpts) );

    // template 41: RecordsToRemoveTransferViewToolbar
    fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}UpdatePanel/components/${ejbOpts.nameLc}AssociationsPage/${ejbOpts.sortedAssociations[i].targetModelLc}TransferLists/${ejbOpts.sortedAssociations[i].targetModelPlLc}ToRemoveTransferView/components`, `${ejbOpts.sortedAssociations[i].targetModelPlCp}ToRemoveTransferViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'modelTable/components/modelUpdatePanel/components/modelAssociationsPage/associationTransferLists/recordsToRemoveTransferView/components/RecordsToRemoveTransferViewToolbar', ejbOpts) );

  }

});


 Promise.all(promises).then( (values) =>{
   //msg
   if(verbose) {
     for(var i=0; i<values.length; i++)
     {
      console.log("@@@ file generated: ", colors.dim(values[i]));
     }
   }
 })
 .catch((error)=>{console.log(error); console.log("SOMETHING WRONG")});


console.log("\nDONE\n");

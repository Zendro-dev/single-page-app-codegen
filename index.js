#!/usr/bin/env node
ejs = require('ejs');
inflection = require('inflection');
fs = require('fs-extra');
path = require('path');
jsb = require('js-beautify').js_beautify;
funks = require(path.resolve(__dirname, 'funks.js'));
program = require('commander');
const colors = require('colors/safe');

modelsCreated = require(path.resolve(__dirname, 'modelsNames.js'));


/*
 * Parse & set command-line-arguments
 */
program
  .description('Code generator for SPA')
  .option('-f, --jsonFiles <filesFolder>', 'Folder containing one json file for each model')
  .option('-o, --outputDirectory <directory>', 'Directory where generated code will be written')
  .option('-D, --createBaseDirs', 'Try to create base directories if they do not exist')
  .option('-v, --verbose', 'Show details about the results of running code generation process')
  .parse(process.argv);

//check input JSON files
if(!program.jsonFiles){
  //msg
  console.log(colors.red('! Error: '), 'You must indicate the json files in order to generate the code.');
  process.exit(1);
}

//ops: output/input directories
let jsonFiles = program.jsonFiles;
let directory = program.outputDirectory || __dirname;
//msg
console.log('Input directory: ', colors.dim(path.resolve(jsonFiles)));
console.log('Output directory: ', colors.dim(path.resolve(directory)));

//op: verbose
let verbose = program.verbose !== undefined ? true : false;

//op: createBaseDirs
let createBaseDirs = program.createBaseDirs !== undefined ? true : false;

/*
 * Check: required directories
 */
let allRequiredDirsExists = true;
let allRequiredDirsCreated = true;
let requiredDirs=
  ['src',
    'src/components',
    'src/requests',
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
    console.log('@@ dir: ', colors.dim(dir), "... ", colors.red('does not exist') );

    //create dir
    if(createBaseDirs) {
      try {
        fs.mkdirSync(dir, {recursive: true});
        //msg
        if(verbose) console.log("@@@ dir created: ", colors.dim(dir), "... ", colors.green('ok') );
      } catch(e) {
        allRequiredDirsCreated = false;
        //err
        console.log(colors.red("! mkdir.error: "), "A problem occured while trying to create a required directory, please ensure you have the sufficient privileges to create directories and that you have a recent version of NodeJS");
        console.log(colors.red("!@ mkdir.error: "), e);
      }
    } else {
      allRequiredDirsCreated = false;
    }

  }
}
if(allRequiredDirsExists || allRequiredDirsCreated) {
  //msg
  console.log(colors.white('@ ', colors.green('done')));
} else {
  //msg
  console.log(colors.red('! Error: '), 'Some required directories does not exists on output base-directory');
  process.exit(1);
}

/*
 * Parse, validate JSON model definitions & set options for EJS templates.
 */
//msg
console.log(colors.white('\n@ Processing JSON files in: \n', colors.dim(path.resolve(jsonFiles)), "\n"));

let opts = [];
let promises = []
let totalFiles = 0;
let totalWrongFiles = 0;

//process input JSON files
fs.readdirSync(jsonFiles).forEach( (json_file) => {
  totalFiles++;
  
  //parse
  let fileData = funks.parseFile(jsonFiles + '/'+json_file );
  if(fileData === null) return;
  
  //msg
  if(verbose) console.log("@@ Processing model in: ", colors.blue(json_file));
  
  //do semantic validation
  let check_json_model = funks.checkJsonDataFile(fileData);
  
  //if no-valid
  if(!check_json_model.pass) {
    //err
    console.log("@@@ Error on model: ", colors.blue(json_file));

    totalWrongFiles++;
    check_json_model.errors.forEach( (error) =>{
      //err
      console.log("@@@", colors.red(error));
    });
    return;

  } else { //valid json
    //msg
    if(verbose) console.log("@@ ", colors.green('done'));
    opts.push(funks.fillOptionsForViews(fileData));
  }
});
//add extra attributes
funks.addPeerRelationName(opts);
funks.addExtraAttributesAssociations(opts);

//msg
console.log("\n@@ Total JSON files processed: ", colors.blue(totalFiles));
//msg
console.log("@@ Total JSON files processed with errors: ", (totalWrongFiles>0) ? colors.red(totalWrongFiles) : colors.green(totalWrongFiles));
if(opts.length === 0) {
  //msg
  console.log("@ No JSON files was processed successfully... ", colors.green('done'));
  process.exit(1);
} else {
  //msg
  console.log("@ ", colors.green('done'));
}

/*
 * Code generation
 */
let modelsOpts = {models: [], adminModels: []};
let modelAtts = {};
//msg
console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(directory))), "\n");
opts.forEach((ejbOpts) => {

  /**
   * Check: non-supported storage types:
   * - 'cenzontle-web-service-adapter'
   */
  if(ejbOpts.storageType === 'cenzontle-web-service-adapter'){
    //msg
    console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.yellow('omited'), ' cenzontle-web-service-adapter (nothing to do on spa)');
    return;
  }

  // set table path
  var tablePath = 'src/components/main-panel/table-panel/models-tables';
  
  // collect models and attributes
  if(ejbOpts.nameLc === 'role' || ejbOpts.nameLc === 'user' || ejbOpts.nameLc === 'userInfo') {
    tablePath = 'src/components/main-panel/table-panel/admin-tables';
    modelsOpts.adminModels.push(ejbOpts);
  } else {
    modelsOpts.models.push(ejbOpts);
  }
  modelAtts[ejbOpts.name] = ejbOpts.attributesArr;

  /*
   * Create required directories
   */
  //msg
  if(verbose) console.log(colors.white('\n@@ Creating required directories...'));
  //table
  let modelTableDirs = [
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`),
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`),
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`),
    path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
  ]
  //associations
  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    let assocLc = ejbOpts.sortedAssociations[i].relationNameLc;
    modelTableDirs.push(path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-add-transfer-view/components`));
    modelTableDirs.push(path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-add-transfer-view/components`));
    if(ejbOpts.sortedAssociations[i].type === 'to_many') {
      modelTableDirs.push(path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-remove-transfer-view/components`));
    }
    modelTableDirs.push(path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-compact-view/components`));
  }
  //routes
  modelTableDirs.push(path.resolve(directory, 'src/routes'));

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
        console.log(colors.red("\nDONE"));
        process.exit(1);
      }
    } else {
      //msg
      if(verbose) console.log("@@@ dir exists: ", colors.dim(dir));
    }
  }
  //msg
  if(verbose)console.log("@@ ", colors.green('done'));

  /**
   * Debug
   */
  //console.log("ejbOpts: ", ejbOpts);
  //console.log("fileData: ", fileData);

  /*
   * Generate code
   */

  /**
   * modelTable
   * 
   * */

  // template 1: ModelEnhancedTable
  var fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/`, `${ejbOpts.nameCp}EnhancedTable.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/ModelEnhancedTable', ejbOpts) );

  // template 2: ModelUploadFileDialog
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}UploadFileDialog.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/ModelUploadFileDialog', ejbOpts) );

  // template 3: ModelEnhancedTableToolbar
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}EnhancedTableToolbar.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/ModelEnhancedTableToolbar', ejbOpts) );

  // template 4: ModelEnhancedTableHead
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}EnhancedTableHead.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/ModelEnhancedTableHead', ejbOpts) );

  // template 5: ModelDeleteConfirmationDialog
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}DeleteConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/ModelDeleteConfirmationDialog', ejbOpts) );

  // template 5_b: ModelCursorPagination
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}CursorPagination.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/ModelCursorPagination', ejbOpts) );

  /**
   * modelTable - modelCreatePanel 
   * 
   * */

  // template 6: ModelCreatePanel
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/`, `${ejbOpts.nameCp}CreatePanel.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/ModelCreatePanel', ejbOpts) );

  // template 7: ModelTabsA
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/`, `${ejbOpts.nameCp}TabsA.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/ModelTabsA', ejbOpts) );

  // template 8: ModelConfirmationDialog
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/ModelConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelCreatePanel - modelAttributes 
   * 
   * */

  // template 9: ModelAttributesPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts) );

  // template 10: ModelAttributesFormView
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts) );

  // template 11: BoolField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts) );

  // template 12: DateField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts) );

  // template 13: DateTimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts) );

  // template 14: FloatField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts) );

  // template 15: IntField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts) );

  // template 16: StringField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts) );

  // template 17: TimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts) );

  /**
   * modelTable - modelCreatePanel - modelAssociations
   * 
   * */

  // template 18: ModelAssociationsPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts) );

  // template 19: ModelAssociationsMenuTabs
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts) );

  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    ejbOpts.aindex = i;

    // template 20: AssociationTransferLists
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/`, `${ejbOpts.sortedAssociations[i].relationNameCp}TransferLists.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/AssociationTransferLists', ejbOpts) );

    // template 21: RecordsToAddTransferView
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferView.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/RecordsToAddTransferView', ejbOpts) );

    // template 22: RecordsToAddTransferViewToolbar
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewToolbar', ejbOpts) );
  
    // template 22_b: RecordsToAddTransferViewCursorPagination
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewCursorPagination.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewCursorPagination', ejbOpts) );
  }

  /**
   * modelTable - modelUpdatePanel 
   * 
   * */

  // template 23: ModelUpdatePanel
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/`, `${ejbOpts.nameCp}UpdatePanel.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/ModelUpdatePanel', ejbOpts) );

  // template 24: ModelTabsA
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/`, `${ejbOpts.nameCp}TabsA.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/ModelTabsA', ejbOpts) );

  // template 25: ModelConfirmationDialog
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/ModelConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelUpdatePanel - modelAttributes 
   * 
   * */

  // template 26: ModelAttributesPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts) );

  // template 27: ModelAttributesFormView
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts) );

  // template 28: BoolField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts) );

  // template 29: DateField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts) );

  // template 30: DateTimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts) );

  // template 31: FloatField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts) );

  // template 32: IntField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts) );

  // template 33: StringField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts) );

  // template 34: TimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts) );

  /**
   * modelTable - modelUpdatePanel - modelAssociations
   * 
   * */

  // template 35: ModelAssociationsPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts) );

  // template 36: ModelAssociationsMenuTabs
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts) );

  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    ejbOpts.aindex = i;

    // template 37: AssociationTransferLists
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/`, `${ejbOpts.sortedAssociations[i].relationNameCp}TransferLists.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/AssociationTransferLists', ejbOpts) );

    // template 38: RecordsToAddTransferView
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferView.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/RecordsToAddTransferView', ejbOpts) );

    // template 39: RecordsToAddTransferViewToolbar
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewToolbar', ejbOpts) );

    // template 39_b: RecordsToAddTransferViewCursorPagination
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewCursorPagination.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewCursorPagination', ejbOpts) );

    if(ejbOpts.sortedAssociations[i].type === 'to_many') {
      // template 40: RecordsToRemoveTransferView
      fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferView.js`);
      promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/RecordsToRemoveTransferView', ejbOpts) );

      // template 41: RecordsToRemoveTransferViewToolbar
      fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferViewToolbar.js`);
      promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/components/RecordsToRemoveTransferViewToolbar', ejbOpts) );

      // template 41_b: RecordsToRemoveTransferViewCursorPagination
      fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferViewCursorPagination.js`);
      promises.push( funks.renderToFile(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/components/RecordsToRemoveTransferViewCursorPagination', ejbOpts) );
    }

  }

   /**
   * modelTable - modelDetailPanel 
   * 
   * */

  // template 42: ModelDetailPanel
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/`, `${ejbOpts.nameCp}DetailPanel.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/ModelDetailPanel', ejbOpts) );

  /**
   * modelTable - modelDetailPanel - modelAttributes 
   * 
   * */

  // template 43: ModelAttributesPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts) );

  // template 44: ModelAttributesFormView
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts) );

  // template 45: BoolField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts) );

  // template 46: DateField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts) );

  // template 47: DateTimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts) );

  // template 48: FloatField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts) );

  // template 49: IntField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts) );

  // template 50: StringField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts) );

  // template 51: TimeField
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts) );

  /**
   * modelTable - modelDetailPanel - modelAssociations
   * 
   * */

  // template 52: ModelAssociationsPage
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts) );

  // template 53: ModelAssociationsMenuTabs
  fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
  promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts) );

  for(var i=0; i<ejbOpts.sortedAssociations.length; i++)
  {
    ejbOpts.aindex = i;

    // template 54: AssociationCompactView
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactView.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/AssociationCompactView', ejbOpts) );

    // template 55: AssociationCompactViewToolbar
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactViewToolbar.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/components/AssociationCompactViewToolbar', ejbOpts) );

    // template 55_b: AssociationCompactViewCursorPagination
    fpath = path.resolve(directory, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactViewCursorPagination.js`);
    promises.push( funks.renderToFile(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/components/AssociationCompactViewCursorPagination', ejbOpts) );

  }

  //msg
  console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
});
opts = null;

//sort models
modelsOpts.models.sort(function (a, b) {
  if (a.nameCp > b.nameCp) {
    return 1;
  }
  if (a.nameCp < b.nameCp) {
    return -1;
  }
  return 0;
});
//sort admin models
modelsOpts.adminModels.sort(function (a, b) {
  if (a.nameCp > b.nameCp) {
    return 1;
  }
  if (a.nameCp < b.nameCp) {
    return -1;
  }
  return 0;
});

/**
 * Debug
 */
//console.log("modelsOpts: ", modelsOpts);
//console.log("modelAtts: ", modelAtts);

/**
 * requests - model
 * 
 * */
// template 56: model
for(let i=0; i<modelsOpts.models.length; i++)
{
  let m = modelsOpts.models[i];
  m.modelsAtts = modelAtts;

  /**
   * Debug
   */
  //console.log("MODEL_OPTS: ", m);

  fpath = path.resolve(directory, `src/requests/`, `${m.nameLc}.js`);
  promises.push( funks.renderToFile(fpath, 'requests/model', m) );
}
for(let i=0; i<modelsOpts.adminModels.length; i++)
{
  let m = modelsOpts.adminModels[i];
  m.modelsAtts = modelAtts;

  /**
   * Debug
   */
  //console.log("MODEL_OPTS: ", m);

  fpath = path.resolve(directory, `src/requests/`, `${m.nameLc}.js`);
  promises.push( funks.renderToFile(fpath, 'requests/model', m) );
}

/**
 * requests - index & searchAttributes
 * 
 * */
// template 57: requests.index
fpath = path.resolve(directory, `src/requests/`, `requests.index.js`);
promises.push( funks.renderToFile(fpath, 'requests/requests.index', modelsOpts) );

// template 58: requests.attributes
fpath = path.resolve(directory, `src/requests/`, `requests.attributes.js`);
promises.push( funks.renderToFile(fpath, 'requests/requests.attributes', modelsOpts) );

/**
 * routes
 * 
 * */
// template 59: routes
fpath = path.resolve(directory, `src/routes/`, `routes.js`);
promises.push( funks.renderToFile(fpath, 'routes/routes', modelsOpts) );

// template 60: TablesSwitch
fpath = path.resolve(directory, `src/components/main-panel/table-panel/`, `TablesSwitch.js`);
promises.push( funks.renderToFile(fpath, 'routes/TablesSwitch', modelsOpts) );

/**
 * acl_rules
 * 
 * */
// template 61: acl_rules
fpath = path.resolve(directory, `src/`, `acl_rules.js`);
promises.push( funks.renderToFile(fpath, 'acl/acl_rules', modelsOpts) );

/**
 * utils
 * 
 * */
// template 62: utils
fpath = path.resolve(directory, `src/`, `utils.js`);
promises.push( funks.renderToFile(fpath, 'utils/utils') );


Promise.all(promises).then( (values) => {
  
  //msg
  if(verbose) {
    for(var i=0; i<values.length; i++)
    {
      //msg
      console.log("@@@ file generated: ", colors.dim(values[i]));
    }
    //msg
    console.log("@@@ Total generated files: ", colors.green(values.length));
    //msg
    console.log("@@ Listing generated files ...", colors.green('done'));
  }

  //msg
  console.log("@ Code generation: ", colors.green('done'));

})
.catch((error)=>{
  console.log(error); console.log("SOMETHING WRONG");
});

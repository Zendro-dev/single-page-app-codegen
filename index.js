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
  .parse(process.argv);
// Do your job:

if(!program.jsonFiles){
  //msg
  console.log(colors.red('! Error: '), 'You must indicate the json files in order to generate the code.');
  process.exit(1);
}

// Output directory
let directory = program.outputDirectory || __dirname;
//msg
console.log('Output base-directory: ', colors.grey(path.resolve(directory)));

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
    console.log('dir: ', colors.grey(dir), "... ", colors.green('ok') );
  } else {
    //msg
    allRequiredDirsExists = false;
    console.log('dir: ', colors.grey(dir), "... ", colors.red('does not exist') );
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
  console.log("\n@@ Proccessing model in: ", colors.blue(json_file));
  let check_json_model = funks.checkJsonDataFile(fileData);
  if(!check_json_model.pass){
    totalWrongFiles++;
    check_json_model.errors.forEach( (error) =>{
      console.log(colors.red(error));
    });
    //msg
    console.log(colors.grey("@@@ Cheking json model definition... "), colors.red('error'));
    return;
  } else {
    //msg
    console.log(colors.grey("@@@ Cheking json model definition... "), colors.green('done'));
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
      fs.mkdirSync(dir, {recursive: true});
      //msg
      console.log("@@@ dir created: ", colors.grey(dir));
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
  promises.push( funks.renderToFile(fpath, 'ModelEnhancedTable', ejbOpts) );

  // template 2: ModelUploadFileDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}UploadFileDialog.js`);
  promises.push( funks.renderToFile(fpath, 'ModelUploadFileDialog', ejbOpts) );

  // template 3: ModelEnhancedTableToolbar
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}EnhancedTableToolbar.js`);
  promises.push( funks.renderToFile(fpath, 'ModelEnhancedTableToolbar', ejbOpts) );

  // template 4: ModelEnhancedTableHead
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}EnhancedTableHead.js`);
  promises.push( funks.renderToFile(fpath, 'ModelEnhancedTableHead', ejbOpts) );

  // template 5: ModelDeleteConfirmationDialog
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/`, `${ejbOpts.nameCp}DeleteConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'ModelDeleteConfirmationDialog', ejbOpts) );

  /**
   * modelTable - modelCreatePanel 
   * 
   * */

  // template 6: ModelCreatePanel
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/`, `${ejbOpts.nameCp}CreatePanel.js`);
  promises.push( funks.renderToFile(fpath, 'ModelCreatePanel', ejbOpts) );

  // template 7: ModelTabsA
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/`, `${ejbOpts.nameCp}TabsA.js`);
  promises.push( funks.renderToFile(fpath, 'ModelTabsA', ejbOpts) );

  // template 8: ModelConfirmationDialog-Create
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
  promises.push( funks.renderToFile(fpath, 'ModelConfirmationDialog-Create', ejbOpts) );

  // template 9: ModelAttributesPage-Create
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/`, `${ejbOpts.nameCp}AttributesPage.js`);
  promises.push( funks.renderToFile(fpath, 'ModelAttributesPage-Create', ejbOpts) );

  // template 10: ModelAttributesFormView-Create
  fpath = path.resolve(directory, `src/components/mainPanel/tablePanel/${ejbOpts.nameLc}Table/components/${ejbOpts.nameLc}CreatePanel/components/${ejbOpts.nameLc}AttributesPage/${ejbOpts.nameLc}AttributesFormView/`, `${ejbOpts.nameCp}AttributesFormView.js`);
  promises.push( funks.renderToFile(fpath, 'ModelAttributesFormView-Create', ejbOpts) );

});


 Promise.all(promises).then( (values) =>{
 })
 .catch((error)=>{console.log(error); console.log("SOMETHING WRONG")});


console.log("\nDONE\n");

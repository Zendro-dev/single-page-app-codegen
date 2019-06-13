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
  console.log("ERROR: You must indicate the json files in order to generate the code.");
  process.exit(1);
}


let directory = program.outputDirectory || __dirname;

console.log('\nRender GUI components for model in: ', path.resolve(directory));
let promises = []
let totalFiles = 0;
let totalWrongFiles = 0;
fs.readdirSync(program.jsonFiles).forEach( async (json_file) =>{
  totalFiles++;
  let fileData = funks.parseFile(program.jsonFiles + '/'+json_file );
  let check_json_model = funks.checkJsonDataFile(fileData);
  if(!check_json_model.pass){
    totalWrongFiles++;
    check_json_model.errors.forEach( (error) =>{
        console.log(colors.red(error));
    });
    return
  }

  let ejbOpts = funks.fillOptionsForViews(fileData);
  console.log("Proccessing ", ejbOpts.name)
  let componentsDir = path.resolve(directory, "src", "components")
  // table
  let table = path.resolve(componentsDir, ejbOpts['namePl'] + '.vue')
  promises.push( funks.renderToFile(table, 'tableView', ejbOpts) )
  // custom actions
  let customActions = path.resolve(componentsDir, ejbOpts.name +
    'CustomActions.vue')
  promises.push( funks.renderToFile(customActions, 'customActions', ejbOpts))
  // details
  let details = path.resolve(componentsDir, ejbOpts.name + 'DetailRow.vue')
  promises.push( funks.renderToFile(details, 'detailView', ejbOpts))
  // form elements
  // console.log("belongsTosArr: " + JSON.stringify(ejbOpts.belongsTosArr));
  let formElmns = path.resolve(componentsDir, ejbOpts.name + 'FormElemns.vue')
  promises.push( funks.renderToFile(formElmns, 'formElements', ejbOpts))
  // create form
  let createForm = path.resolve(componentsDir, ejbOpts.name + 'CreateForm.vue')
  promises.push( funks.renderToFile(createForm, 'createForm', ejbOpts))
  // upload CSV / XLSX form
  let uploadCsvForm = path.resolve(componentsDir, ejbOpts.name + 'UploadCsvForm.vue')
  promises.push( funks.renderToFile(uploadCsvForm, 'uploadCsvForm', ejbOpts))
  // edit form
  let editForm = path.resolve(componentsDir, ejbOpts.name + 'EditForm.vue')
  promises.push( funks.renderToFile(editForm, 'editForm', ejbOpts))
  // routes
  let routesExt = path.resolve(directory, "src", "router", ejbOpts.name +
    "Routes.js")
  promises.push( funks.renderToFile(routesExt, 'routes', ejbOpts))
  //graphql request
  let grapqlRequestPath = path.resolve(directory, "src", "requests", ejbOpts.nameLc + ".js")
  promises.push( funks.renderToFile(grapqlRequestPath, "graphqlRequests", ejbOpts))
  // constants
  let constants = path.resolve(directory, "src", "sciencedb-globals.js")
  promises.push( funks.renderToFile(constants, 'global_constant', ejbOpts))
});

 Promise.all(promises).then( (values) =>{

   //Copy static (not to be rendered) code into target dir, if not already
   //present:
   let filtBarPath = path.resolve(directory, 'src', 'components', 'FilterBar.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname, 'FilterBar.vue'), filtBarPath)
   let forKeyPath = path.resolve(directory, 'src', 'components',
     'foreignKeyFormElement.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname, 'foreignKeyFormElement.vue'),
     forKeyPath)
   let hasManyPath = path.resolve(directory, 'src', 'components',
     'hasManyFormElemn.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname, 'hasManyFormElemn.vue'),
     hasManyPath)
   let datePickerPath = path.resolve(directory, 'src', 'components',
     'datePicker.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname, 'datePicker.vue'),
     datePickerPath)
   let addNewPath = path.resolve(directory, 'src', 'components', 'AddNewEntityButton.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname, 'AddNewEntityButton.vue'), addNewPath)
   let scrollPath = path.resolve(directory, 'src', 'components', 'scrollListElement.vue')
   funks.copyFileIfNotExists(path.resolve(__dirname,'scrollListElement.vue'), scrollPath)

   //automatically injects models components into routes array (routes_index.js file)
   let modelsObj = modelsCreated.getSavedModelsNames("", directory);
   let indexRoutesExt = path.resolve(directory, "src", "router", "routes_index.js")
   funks.renderToFile(indexRoutesExt, 'routes_index', modelsObj)
   let sideNavPath = path.resolve(directory,"src","components","SideNav.vue")
   funks.renderToFile(sideNavPath, 'sideNav', modelsObj)
   let indexRequestPath = path.resolve(directory, "src", "requests", "index.js")
   funks.renderToFile(indexRequestPath, 'request_index', modelsObj)

   //Log summary about the data models
   console.log(colors.yellow(`From ${totalFiles} files in the folder. The files proccesed without error where ${totalFiles - totalWrongFiles}.`))
   console.log(colors.yellow(`And ${totalWrongFiles} presented errors. Please see above for more info about each error.`))
 })
 .catch((error)=>{console.log(error); console.log("SOMETHING WRONG")});


console.log("\nDONE\n");

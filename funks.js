var unique = require('array-unique');
var exports = module.exports = {};
var fs = require('fs-extra');
var inflection = require('inflection')
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile )

/**
 * renderTemplate - Generate the Javascript code as string using EJS templates views
 *
 * @param  {string} templateName Name of the template view to use
 * @param  {object} options      Options that the template will use to fill generic spaces
 * @return {string}              String of created file with specified template
 */
exports.renderTemplate = async function(templateName, options) {
  try {
    return await ejsRenderFile(__dirname + '/views/pages/' + templateName +
      '.ejs', options, {})
  } catch (err) {
    console.log(`ERROR rendering template ${templateName}:\n${err}`);
  }
}

/**
 * renderToFile - Given a template view it generates the code as string
 * and writes the code in a output file.
 *
 * @param  {string} outFile      path to output file where code will be written
 * @param  {string} templateName template view name to use for generating code
 * @param  {object} options      Options to fill the template
 * @return {promise}              Promise will be resolved with success message if the file is written successfully, rejected with error otherwise.
 */
exports.renderToFile = async function(outFile, templateName, options) {
  // console.log("options:\n" + JSON.stringify(options) + "\n");
  let fileCont = await exports.renderTemplate(templateName, options)
  p = new Promise((resolve, reject) =>{

    fs.writeFile(outFile, fileCont,
      function(err) {
        if (err) {
          console.log(err)
          reject(err);
          //return err
        } else {
          console.log("Wrote rendered content into '%s'.", outFile)
          resolve();
        }
      })
  });

  return p;
}

// Parse input 'attributes' argument into array of arrays:
// [ [ 'name':'string' ], [ 'is_human':'boolean' ] ]
//


/**
 * exports - Parse input 'attributes' argument into array of arrays:
 *
 * @param  {string} attributesStr Attributes as string
 * @return {array}                Array of arrays each item is as array with field name and its type (example [ [ 'name','string' ], [ 'is_human','boolean' ] ])
 */
exports.attributesArray = function(attributesStr) {
  if (attributesStr !== undefined && attributesStr !== null && typeof attributesStr ===
    'string') {
    return attributesStr.trim().split(/[\s,]+/).map(function(x) {
      return x.trim().split(':')
    });
  } else {
    return []
  }
}

/**
 * typeAttributes - Collect attributes into a map with keys the attributes' types and values the attributes' names
 *
 * @param  {array} attributesArray Array of arrays each item is as array with field name and its type
 * @return {object}                 Map with keys the attributes' types and values the attributes' names (example: { 'string': [ 'name', 'last_name' ], 'boolean': [ 'is_human' ] })
 */
exports.typeAttributes = function(attributesArray) {
  y = {};
  attributesArray.forEach(function(x) {
    if (!y[x[1]]) y[x[1]] = [x[0]]
    else y[x[1]] = y[x[1]].concat([x[0]])
  })
  return y;
}


/**
 * uncapitalizeString - set initial character to lower case
 *
 * @param  {string} word String input to uncapitalize
 * @return {string}      String with lower case in the initial character
 */
uncapitalizeString = function(word){
  let length = word.length;
  if(length==1){
    return word.toLowerCase();
  }else{
    return word.slice(0,1).toLowerCase() + word.slice(1,length);
  }
}


/**
 * capitalizeString - set initial character to upper case
 *
 * @param  {type} word String input to capitalize
 * @return {type}      String with upper case in the initial character
 */
capitalizeString = function(word){
  let length = word.length;
  if(length==1){
    return word.toUpperCase();
  }else{
    return word.slice(0,1).toUpperCase() + word.slice(1,length);
  }
}


// Copies file found under sourcePath to targetPath if and only if target does
// not exist:


/**
 * copyFileIfNotExists - Copies file found under sourcePath to targetPath if and only if target does not exist.
 *
 * @param  {string} sourcePath Source path where file to copy is stored
 * @param  {type} targetPath Target path where source file will be copied
 */
exports.copyFileIfNotExists = async function(sourcePath, targetPath) {

    fs.stat(targetPath, function(err, stat) {
      if (err != null) {
        fs.copySync(sourcePath, targetPath);
      }
    });
}


/**
 * parseFile - Parse a json file
 *
 * @param  {string} jFile path where json file is stored
 * @return {object}       json file converted to js object
 */
exports.parseFile = function(jFile){
  let data=fs.readFileSync(jFile, 'utf8');
  let words=JSON.parse(data);
  return words;
}


/**
 * fillOptionsForViews - Creates object with all extra info and with all data model info that templates will use.
 *
 * @param  {object} fileData object originally created from a json file containing data model info.
 * @return {object}          Object with all extra data model info that will be needed to create files with templates.
 */
exports.fillOptionsForViews = function(fileData){
  //fileData = parseFile(jFile);
  let associations = parseAssociationsFromFile(fileData.associations);
  let opts = {
    baseUrl: fileData.baseUrl,
    //check compatibility with name in express_graphql_gen
    name: fileData.model,
    // nameLc: fileData.model.toLowerCase(),
    // namePl: inflection.pluralize(fileData.model.toLowerCase()),
    // namePlLc: inflection.pluralize(fileData.model.toLowerCase()).toLowerCase(),
    // nameCp: inflection.capitalize(fileData.model),
    nameLc: uncapitalizeString(fileData.model),
    namePl: inflection.pluralize(uncapitalizeString(fileData.model)),
    namePlLc: inflection.pluralize(uncapitalizeString(fileData.model)),
    nameCp: capitalizeString(fileData.model),
    attributesArr: attributesArrayFromFile(fileData.attributes),
    typeAttributes: exports.typeAttributes(attributesArrayFromFile(fileData.attributes)),
    belongsTosArr: associations.belongsTos,
    hasManysArr: associations.hasManys
  }

  return opts;
}


/**
 * attributesArrayFromFile - Given a object containing attributes description, this function will
 * convert it to an array of arrays, where each item is as array with field name and its type (example [ [ 'name','string' ], [ 'is_human','boolean' ] ])
 *
 * @param  {object} attributes Object with keys the name of the field and value its type.
 * @return {array}            array of arrays, where each item is as array with field name and its type (example [ [ 'name','string' ], [ 'is_human','boolean' ] ])
 */
attributesArrayFromFile = function(attributes){
  let attArray = []

  for(attr in attributes){
    attArray.push([ attr, attributes[attr] ]);
  }

  return attArray;
}


/**
 * parseAssociationsFromFile - Parse associations description for a given model
 *
 * @param  {object} associations Object where each key is an association and its value is the info related to that association.
 * @return {object}              Associations classified as 'belongsTos' and 'hasManys'. Each association will contain all extra information required by the tamplatees views.
 */
parseAssociationsFromFile = function(associations){
  let assoc = {
    "belongsTos" : [],
    "hasManys" : []
  }

  if(associations!==undefined){

    Object.entries(associations).forEach( ([name, association]) =>{
      let type = association.type.split("_")[1];

      if(type === "belongsTo"){
        let bt = {
          "targetModel": association.target.toLowerCase(),
          "foreignKey": association.targetKey,
          "primaryKey" : "id",
          "label" : association.label,
          //sublabel can be undefined
          "sublabel" : association.sublabel,
          "targetModelLc" : association.target.toLowerCase(),
          "targetModelPlLc" : inflection.pluralize(association.target).toLowerCase(),
          "targetModelCp" : inflection.capitalize(association.target),
          "targetModelPlCp": inflection.capitalize(inflection.pluralize(association.target)),
          "relationName" : name
        }

        assoc.belongsTos.push(bt);
      }else if(type==="hasMany" || type==="belongsToMany"){
        let hm = {
          "relationName" : name,
          "targetModelPlLc" : inflection.pluralize(association.target).toLowerCase(),
          "targetModelCp" : inflection.capitalize(association.target),
          "targetModelPlCp": inflection.capitalize(inflection.pluralize(association.target)),
          "label" : association.label,
          //sublabel can be undefined
          "sublabel" : association.sublabel
        }

        assoc.hasManys.push(hm);
      }else{
        //association hasOne??
        console.log("Association type"+ association.type + "not supported.");
      }
    });
  }
  return assoc;
}

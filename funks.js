var unique = require('array-unique');
var exports = module.exports = {};
var fs = require('fs-extra');
var inflection = require('inflection')
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile )
const colors = require('colors/safe');

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
  let fileCont = await exports.renderTemplate(templateName, options)
  p = new Promise((resolve, reject) =>{

    fs.writeFile(outFile, fileCont,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(outFile);
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
exports.uncapitalizeString = function(word){
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
exports.capitalizeString = function(word){
  let length = word.length;
  if(length==1){
    return word.toUpperCase();
  }else{
    return word.slice(0,1).toUpperCase() + word.slice(1,length);
  }
}

/**
 * snakeToPascalCase - converts string from snake case to pascal case.
 *
 * @param  {type} word String input to convert.
 * @return {type}      String on pascal case.
 */
exports.toPascalCase = function(word){
  return exports.capitalizeString(word.replace(
    /([-_][a-z])/ig,
    (match) => match.toUpperCase()
                    .replace('-', '')
                    .replace('_', '')
  ));
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
  let words = null;
  try {
    words=JSON.parse(data);
  } catch (e) {
    //msg
    console.log(colors.red('\n! Error: '), 'Parsing JSON model definition file: ', colors.dim(jFile));
    console.log(colors.red('!@ Error name: ', e.name, ': '), e.message);
    words = null;
  }
  return words;
}



/**
 * checkJsonDataFile - description
 *
 * @param  {object} json_file_data Javascript object parser from json file containgin a model info
 * @return {object}                Contains a boolean indicatin if the model data is described correctly and an array of errors.
 */
exports.checkJsonDataFile = function(json_file_data){
  let result = {
    pass : true,
    errors: []
  }

  //check for required json fields
  //'model'
  if(!json_file_data.hasOwnProperty('model')) {
    result.pass = false;
    result.errors.push(`ERROR: 'model' is a mandatory field.`);
  } else {
    //check 'model' type
    if(typeof json_file_data.model !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'model' field must be a string.`);
    }
  }
  //'storageType'
  if(!json_file_data.hasOwnProperty('storageType')) {
    result.pass = false;
    result.errors.push(`ERROR: 'storageType' is a mandatory field.`);
  } else {
    //check 'storageType' type
    if(typeof json_file_data.storageType !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'storageType' field must be a string.`);
    }
  }
  //'attributes'
  if(!json_file_data.hasOwnProperty('attributes')) {
    result.pass = false;
    result.errors.push(`ERROR: 'attributes' is a mandatory field.`);
  } else {
    //check for attributes type
    if(typeof json_file_data.attributes !== 'object') {
      result.pass = false;
      result.errors.push(`ERROR: 'attributes' field must be an object.`);
    } else {
      //check for non empty attributes object
      let keys = Object.keys(json_file_data.attributes);
      if(keys.length === 0) {
        result.pass = false;
        result.errors.push(`ERROR: 'attributes' object can not be empty`);
      } else {
        //check for correct attributes types
        for(var i=0; i<keys.length; ++i) {
          switch(json_file_data.attributes[keys[i]]) {
            case 'String':
            case 'Int':
            case 'Float':
            case 'Boolean':
            case 'Date':
            case 'Time':
            case 'DateTime':
              //ok
              break;
            
            default:
              //not ok
              result.pass = false;
              result.errors.push(`ERROR: 'attribute.${keys[i]}' has an invalid type. One of the following types is expected: [String, Int, Float, Boolean, Date, Time, DateTime]. But '${json_file_data.attributes[keys[i]]}' was obtained.`);
              break;
          }
        }
      }
    }
  }
  //'associations'
  if(json_file_data.hasOwnProperty('associations')) {
    //check 'associations' type
    if(typeof json_file_data.associations !== 'object') {
      result.pass = false;
      result.errors.push(`ERROR: 'associations' field must be an object.`);
    }
  }

  //check for label field in each association
  if(json_file_data.associations !== undefined){
    Object.entries(json_file_data.associations).forEach( ([name, association], index) =>{
      if(association.label === undefined || association.label === ''){
        result.pass = false;
        result.errors.push(`ERROR IN MODEL ${json_file_data.model}: 'label' is mandatory field. It should be defined in association ${name}`);
      }
   })
  }

  return result;
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
    nameLc: exports.uncapitalizeString(fileData.model),
    namePl: inflection.pluralize(exports.uncapitalizeString(fileData.model)),
    namePlLc: inflection.pluralize(exports.uncapitalizeString(fileData.model)),
    namePlCp: inflection.pluralize(exports.capitalizeString(fileData.model)),
    nameCp: exports.capitalizeString(fileData.model),
    nameOnPascal: exports.toPascalCase(fileData.model),
    attributesArr: attributesArrayFromFile(fileData.attributes),
    typeAttributes: exports.typeAttributes(attributesArrayFromFile(fileData.attributes)),
    belongsTosArr: associations.belongsTos,
    hasManysArr: associations.hasManys,
    sortedAssociations: associations.sortedAssociations,
    sortedAssociatedModels : associations.sortedAssociatedModels,
    ownForeignKeysArr: associations.ownForeignKeysArr,
    hasOwnForeingKeys: associations.hasOwnForeingKeys,
    hasToManyAssociations: associations.hasToManyAssociations,
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
    "hasManys" : [],
    "sortedAssociations" : [],
    "sortedAssociatedModels" : [],
    "ownForeignKeysArr" : [],
    hasOwnForeingKeys: false,
    hasToManyAssociations: false,
  }

  if(associations!==undefined){

    Object.entries(associations).forEach( ([name, association]) =>{
      let type = association.type;
      let sqlType = getSqlType(association);

      //base association attributes
      let baa = {
        "type" : type,
        "sqlType" : sqlType,
        "primaryKey" : "id",

        "relationName" : name,
        "relationNameCp": exports.capitalizeString(name),
        "relationNameLc": exports.uncapitalizeString(name),
        "relationNameOnPascal": exports.toPascalCase(name),

        "targetModel": association.target,
        "targetModelLc": exports.uncapitalizeString(association.target),
        "targetModelPlLc": inflection.pluralize(exports.uncapitalizeString(association.target)),
        "targetModelCp": exports.capitalizeString(association.target),
        "targetModelPlCp": inflection.pluralize(exports.capitalizeString(association.target)),
        "targetModelOnPascal": exports.toPascalCase(association.target),

        "label" : association.label,
        "sublabel" : association.sublabel
      }

      //sqlType dependent attributes
      switch (sqlType) {
        case "belongsTo":
          assoc.hasOwnForeingKeys = true;
          assoc.ownForeignKeysArr.push(association.targetKey);
          baa.foreignKey = association.targetKey;        
          break;

        case "hasOne":
          baa.foreignKey = association.targetKey;
          break;

        case "belongsToMany":
          break;

        case "hasMany":
          baa.foreignKey = association.targetKey;     
          break;
      
        default:
          //unknown sqlType
          console.log("Association sqlType "+ sqlType + " not supported.");
          break;
      }

      if(type === 'to_one'){
        assoc.belongsTos.push(baa);
        assoc.sortedAssociations.push(baa);
      }else if(type==="to_many"){
        assoc.hasManys.push(baa);
        assoc.sortedAssociations.push(baa);
        assoc.hasToManyAssociations = true;
      }else{
        //unknown type
        console.log("Association type "+ association.type + " not supported.");
      }

    });

    //sort associations
    assoc.sortedAssociations.sort(function (a, b) {
      if (a.targetModelCp > b.targetModelCp) {
        return 1;
      }
      if (a.targetModelCp < b.targetModelCp) {
        return -1;
      }
      return 0;
    });

    //sorted associations names
    let targetModels = [];
    for(let i=0; i<assoc.sortedAssociations.length; i++) {
      if(!targetModels.includes(assoc.sortedAssociations[i].targetModel)) {
        targetModels.push(assoc.sortedAssociations[i].targetModel);
        assoc.sortedAssociatedModels.push({
          targetModel: assoc.sortedAssociations[i].targetModel,
          targetModelLc: assoc.sortedAssociations[i].targetModelLc,
          targetModelPlLc: assoc.sortedAssociations[i].targetModelPlLc,
          targetModelCp: assoc.sortedAssociations[i].targetModelCp,
          targetModelPlCp: assoc.sortedAssociations[i].targetModelPlCp,
          targetModelOnPascal: assoc.sortedAssociations[i].targetModelOnPascal,
        });
      }
    }
  }

  return assoc;
}

getSqlType = function(association){
  if(association.type === 'to_one' && association.keyIn !== association.target){
    return 'belongsTo';
  }else if(association.type === 'to_one' && association.keyIn === association.target){
    return 'hasOne';
  }else if(association.type === 'to_many' && association.hasOwnProperty('sourceKey')){
    return 'belongsToMany';
  }else if(association.type === 'to_many' && association.keyIn === association.target){
    return 'hasMany';
  }else {
    return undefined;
  }
}

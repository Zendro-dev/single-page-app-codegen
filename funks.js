exports = module.exports = {};
const fs = require('fs-extra');
const path = require('path');
const inflection = require('inflection')
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile )
const colors = require('colors/safe');
const { first } = require('lodash');

/**
 * renderTemplate - Generate the Javascript code as string using EJS templates views
 *
 * @param  {string} templateName Name of the template view to use
 * @param  {object} options      Options that the template will use to fill generic spaces
 * @return {string}              String of created file with specified template
 */
exports.renderTemplate = async function(templateName, options) {
  let outFile = __dirname + '/views/pages/' + templateName + '.ejs';
  try {
    return await ejsRenderFile(outFile, options, {});
  } catch(e) {
    //msg
    console.log(colors.red('@@@ Error:'), 'trying to rendering template: ', colors.dim(outFile));
    throw e;
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

/**
 * renderToFileSync - Given a template view it generates the code as string
 * and writes the code in a output file.
 *
 * @param  {string} outFile      path to output file where code will be written
 * @param  {string} templateName template view name to use for generating code
 * @param  {object} options      Options to fill the template
 * @return {promise}              Promise will be resolved with success message if the file is written successfully, rejected with error otherwise.
 */
exports.renderToFileSync = async function(outFile, templateName, options) {
  //generate
  let genFile = await exports.renderTemplate(templateName, options);
  
  //write
  try {
    fs.writeFileSync(outFile, genFile);
    //success
    console.log('@@@ File:', colors.dim(outFile), colors.green('written successfully!'));
  } catch(e) {
    //error
    console.log('@@@ File:', colors.dim(outFile), colors.red('error trying to write.'));
    throw e;
  }
}


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
 * uncapitalizeString - Set initial character to lower case
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
 * capitalizeString - Set initial character to upper case
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
 * snakeToPascalCase - Converts string from snake case to pascal case.
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

/**
 * parseFile - Parse a json file
 *
 * @param  {string} jFile path where json file is stored
 * @return {object}       json file converted to js object
 */
exports.parseFile = function(jFile){
  let data = null;
  let words = null;

  //read
  try {
    data=fs.readFileSync(jFile, 'utf8');
  } catch (e) {
    //msg
    console.log(colors.red('! Error:'), 'Reading JSON model definition file:', colors.dim(jFile));
    console.log(colors.red('! Error name: ' + e.name +':'), e.message);
    throw new Error(e);
  }

  //parse
  try {
    words=JSON.parse(data);
    
    /**
     * Check storageType: exclude adapters.
     */
    if(words&&words.storageType&&typeof words.storageType === 'string')
    {
      switch(words.storageType.toLowerCase()){
        //adapters
        case 'sql-adapter':
        case 'ddm-adapter':
        case 'cenzontle-webservice-adapter':
        case 'generic-adapter':
        //msg
        console.log(colors.white('@@ Adapter: '), colors.blue(words.model+'.'+words.adapterName), ` [${words.storageType}]... `, colors.yellow('excluded'), '');
        words = null;
        break;

        default:
          break;
      }
    } else {
      //msg
      console.log(colors.red('Error: '), "Invalid attributes found: @storageType attribute is not valid. In file:", colors.dim(jFile));
      throw new Error("Invalid attributes found");
    }
  } catch (e) {
    //msg
    console.log(colors.red('Error: '), 'Parsing JSON model definition file: ', colors.dim(jFile));
    throw e;
  }
  return words;
}

/**
 * checkJsonFiles - Semantic validations related to json files.
 *
 * @param  {string} jsonDir       Input directory with json files.
 * @param  {array}  jsonFiles     Array of jsonFiles paths readed from input directory.
 * @param  {object} options       Object with extra options used to generate output.
 * @return {object}               Object containing a boolean status of the validaton process (pass) and an array of errors (errors).
 */
exports.checkJsonFiles = function(jsonDir, jsonFiles, options){
  let result = {
    pass : true,
    errors: []
  }

  /**
   * General checks:
   */
  //'jsonFiles'
  if(jsonFiles.length <= 0) {
    result.pass = false;
    result.errors.push(`ERROR: There are no JSON files on input directory. You should specify some JSON files in order to generate the Cenzontle SPA.`);
  } else {
    
    /**
     * Plotly checks
     */
    let plotlyOptions = options.plotlyOptions;
    let jsonFilesPaths = jsonFiles.map((file) => path.resolve(path.join(jsonDir, file)));

    //genPlotly + modelsWithPlotly
    if(plotlyOptions.genPlotly) {
      /**
       * All models should be one of those in jsonDir
       */
      plotlyOptions.modelsWithPlotly.forEach((file) => {
        if(!jsonFilesPaths.includes(path.resolve(file))) {
          result.pass = false;
          result.errors.push(`ERROR: json model file '${file}' is not in the json input directory.`);
        } 
      });
    }
  }

  return result;
}

/**
 * checkJsonDataFile - Semantic validations are carried out on the definition of the JSON model.
 *
 * @param  {object} jsonModel     Javascript object parsed from JSON model file.
 * @param  {object} options       Object with extra options used to generate output.
 * @return {object}               Object containing a boolean status of the validaton process (pass) and an array of errors (errors).
 */
exports.checkJsonDataFile = function(jsonModel, options){
  let result = {
    pass : true,
    errors: []
  }

  /*
    Checks:
  */

  //'model'
  if(!jsonModel.hasOwnProperty('model')) {
    result.pass = false;
    result.errors.push(`ERROR: 'model' is a mandatory field.`);
  } else {
    //check 'model' type
    if(typeof jsonModel.model !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'model' field must be a string.`);
    }
  }
  
  //'storageType'
  if(!jsonModel.hasOwnProperty('storageType')) {
    result.pass = false;
    result.errors.push(`ERROR: 'storageType' is a mandatory field.`);
  } else {
    //check 'storageType' type
    if(typeof jsonModel.storageType !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'storageType' field must be a string.`);
    } else {
      //check for valid storageType
      switch(jsonModel.storageType.toLowerCase()) {
        //models
        case 'sql':
        case 'distributed-data-model':
        case 'cenz-server':
        case 'generic':
        //adapters
        case 'sql-adapter':
        case 'ddm-adapter':
        case 'cenzontle-webservice-adapter':
        case 'generic-adapter':
        //ok
        break;
        
        default:
          //not ok
          result.pass = false;
          result.errors.push(`ERROR: The attribute 'storageType' has an invalid value. One of the following types is expected: [sql, cenz-server, distributed-data-model, generic]. But '${jsonModel.storageType}' was obtained.`);
          break;
      }
    }
  }
  
  //'attributes'
  if(!jsonModel.hasOwnProperty('attributes')) {
    result.pass = false;
    result.errors.push(`ERROR: 'attributes' is a mandatory field.`);
  } else {
    //check for attributes type
    if(typeof jsonModel.attributes !== 'object') {
      result.pass = false;
      result.errors.push(`ERROR: 'attributes' field must be an object.`);
    } else {
      //check for non empty attributes object
      let keys = Object.keys(jsonModel.attributes);
      if(keys.length === 0) {
        result.pass = false;
        result.errors.push(`ERROR: 'attributes' object can not be empty`);
      } else {
        //check for correct attributes types
        for(var i=0; i<keys.length; ++i) {
          switch(jsonModel.attributes[keys[i]]) {
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
              result.errors.push(`ERROR: 'attribute.${keys[i]}' has an invalid type. One of the following types is expected: [String, Int, Float, Boolean, Date, Time, DateTime]. But '${jsonModel.attributes[keys[i]]}' was obtained.`);
              break;
          }
        }
      }
    }
  }
  
  //'associations'
  if(jsonModel.hasOwnProperty('associations')) {
    //check 'associations' type
    if(typeof jsonModel.associations !== 'object') {
      result.pass = false;
      result.errors.push(`ERROR: 'associations' field must be an object.`);
    }
  }

  //'internalId'
  if(jsonModel.hasOwnProperty('internalId')) {
    //check: 'internalId' type
    if(typeof jsonModel.internalId !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'internalId' attribute should have a value of type 'string', but it has one of type: '${typeof jsonModel.internalId}'`);

    } else {
      //check: the respective attribute has actually been defined in the "attributes" object
      if(!jsonModel.attributes.hasOwnProperty(jsonModel.internalId)) {
        result.pass = false;
        result.errors.push(`ERROR: 'internalId' value has not been defined as an attribute. '${jsonModel.internalId}' is not an attribute.`);

      } else {
        //check: the respective attribute is of the allowed types String, Int, or Float
        switch(jsonModel.attributes[jsonModel.internalId]) {
          case 'String':
          case 'Int':
          case 'Float':
            //ok
            break;

          default:
            //not ok
            result.pass = false;
            result.errors.push(`ERROR: 'internalId' has an invalid type. One of the following types is expected: [String, Int, Float]. But '${jsonModel.attributes[jsonModel.internalId]}' was obtained.`);
            break;
        }
      }
    }
  }

  //'paginationType'
  if(jsonModel.hasOwnProperty('paginationType')) {
    //check: 'paginationType' type
    if(typeof jsonModel.paginationType !== 'string') {
      result.pass = false;
      result.errors.push(`ERROR: 'paginationType' attribute should have a value of type 'string', but it has one of type: '${typeof jsonModel.paginationType}'`);

    } else {
      //check: value should be 'limitOffset' or 'cursorBased';
      if(jsonModel.paginationType !== 'limitOffset' && jsonModel.paginationType !== 'cursorBased') {
        result.pass = false;
        result.errors.push(`ERROR: 'paginationType' value should be either 'limitOffset' or 'cursorBased', but it is: '${jsonModel.paginationType}'`);

      } else {
        //check: cursorBased is the only option for non-sql models
        if( (jsonModel.storageType)&&(String(jsonModel.storageType).toLowerCase() !== 'sql')&&(jsonModel.paginationType !== 'cursorBased') ){
          result.pass = false;
          result.errors.push(`ERROR: 'limitOffset' pagination is not supported on non-sql storage types`);
        }
      }
    }
  }

  //check for label field in each association
  if(jsonModel.associations !== undefined){
    Object.entries(jsonModel.associations).forEach( ([name, association], index) =>{
      //skip generic associations
      if(association.type === 'generic_to_one' || association.type === 'generic_to_many') return;

      //check
      if(association.label === undefined || association.label === ''){
        //warning
        console.log(colors.yellow('@@Warning:'), 'on model:', colors.blue(jsonModel.model), 'on associaton:', colors.blue(name), " - 'label' is not defined.");
      }
   })
  }

  return result;
}

/**
 * fillOptionsForViews - Creates object with all the information about data model that templates will use.
 *
 * @param  {object} fileData  Object originally created from a json file containing data model info.
 * @param  {string} filePath  JSON model file path.
 * @param  {object} options   Object with extra options used to generate output.
 * @return {object}           Object with all data model info that will be used to create files with templates.
 */
exports.fillOptionsForViews = function(fileData, filePath, options){

  //get associations options
  let associations = parseAssociationsFromFile(fileData);

  //set options used by EJS templates
  let opts = {
    baseUrl: fileData.baseUrl,
    name: fileData.model,
    nameLc: exports.uncapitalizeString(fileData.model),
    namePl: inflection.pluralize(exports.uncapitalizeString(fileData.model)),
    namePlLc: inflection.pluralize(exports.uncapitalizeString(fileData.model)),
    namePlCp: inflection.pluralize(exports.capitalizeString(fileData.model)),
    nameCp: exports.capitalizeString(fileData.model),
    nameOnPascal: exports.toPascalCase(fileData.model),
    attributesArr: attributesArrayFromFile(fileData.attributes),
    attributesArrWithoutTargetKeys: attributesWithoutTargetKeysArrayFromFile(fileData.attributes, associations.ownForeignKeysArr),
    typeAttributes: exports.typeAttributes(attributesArrayFromFile(fileData.attributes)),
    belongsTosArr: associations.belongsTos,
    hasManysArr: associations.hasManys,
    sortedAssociations: associations.sortedAssociations,
    sortedAssociatedModels : associations.sortedAssociatedModels,
    ownForeignKeysArr: associations.ownForeignKeysArr,
    hasOwnForeingKeys: associations.hasOwnForeingKeys,
    hasToManyAssociations: associations.hasToManyAssociations,
    internalId: getInternalId(fileData),
    internalIdType: getInternalIdType(fileData),
    isDefaultId: (fileData.internalId) ? false : true,
    paginationType: getPaginationType(fileData),
    storageType: fileData.storageType,
    
    //Plotly
    withPlotly: getWithPlotly(options.plotlyOptions, filePath),
    standalonePlotly: options.plotlyOptions.standalonePlotly,
  }

  return opts;
}

/**
 * addPeerRelationName - Adds 'peerRelation' name-attributes to each association defined on each model.
 *
 * @param  {array} opts Array of already calculated EJS options.
 */
exports.addPeerRelationName = function(opts) {
  let errorsA = []; //target model not found
  let errorsB = []; //peer association not found
  
  //for each model
  opts.forEach( (opt) => {
    
    //for each association
    opt.sortedAssociations.forEach( (association) => {
      //if already has peer-relation name
      if(association.hasOwnProperty('peerRelationName')) {
        //done
        return;
      }

      //find target model
      let found = false;
      for(let i=0; !found && i<opts.length; i++) {
        if(association.targetModel === opts[i].name) {
          found = true;

          /**
           * Generic associations
           * 
           * Peer name will be the targe model name (as no targetKey exists).
           */
          if(association.type === 'generic_to_one' || association.type === 'generic_to_many') {
            //set peer relation names
            association.peerRelationName = association.peerRelationName+'_'+association.type+'_'+opts[i].name;
            association.peerRelationNameCp = association.peerRelationNameCp+'_'+association.type+'_'+opts[i].nameCp;
            association.peerRelationNameLc = association.peerRelationNameLc+'_'+association.type+'_'+opts[i].nameLc;
            association.peerRelationNameOnPascal = association.peerRelationNameOnPascal+'_'+association.type+'_'+opts[i].nameOnPascal;

          } else {
            //find peer association
            let foundB = false;
            for(let j=0; !foundB && j<opts[i].sortedAssociations.length; j++) {
              //case: 'to_one' or 'hasMany'
              if(opts[i].sortedAssociations[j].type === 'to_one' || opts[i].sortedAssociations[j].sqlType === 'hasMany') {
                if(opts[i].sortedAssociations[j].targetKey === association.targetKey) {
                  foundB = true;

                  //set peer relation names
                  association.peerRelationName = opts[i].sortedAssociations[j].relationName;
                  association.peerRelationNameCp = opts[i].sortedAssociations[j].relationNameCp;
                  association.peerRelationNameLc = opts[i].sortedAssociations[j].relationNameLc;
                  association.peerRelationNameOnPascal = opts[i].sortedAssociations[j].relationNameOnPascal;

                  opts[i].sortedAssociations[j].peerRelationName = association.relationName;
                  opts[i].sortedAssociations[j].peerRelationNameCp = association.relationNameCp;
                  opts[i].sortedAssociations[j].peerRelationNameLc = association.relationNameLc;
                  opts[i].sortedAssociations[j].peerRelationNameOnPascal = association.relationNameOnPascal;
                }
              } else if(opts[i].sortedAssociations[j].sqlType === 'belongsToMany') {
                  if(opts[i].sortedAssociations[j].keysIn === association.keysIn) {
                    foundB = true;

                    //set peer relation names
                    association.peerRelationName = opts[i].sortedAssociations[j].relationName;
                    association.peerRelationNameCp = opts[i].sortedAssociations[j].relationNameCp;
                    association.peerRelationNameLc = opts[i].sortedAssociations[j].relationNameLc;
                    association.peerRelationNameOnPascal = opts[i].sortedAssociations[j].relationNameOnPascal;

                    opts[i].sortedAssociations[j].peerRelationName = association.relationName;
                    opts[i].sortedAssociations[j].peerRelationNameCp = association.relationNameCp;
                    opts[i].sortedAssociations[j].peerRelationNameLc = association.relationNameLc;
                    opts[i].sortedAssociations[j].peerRelationNameOnPascal = association.relationNameOnPascal;
                  }
              }
            }
            //check
            if(!foundB) {
              errorsB.push({model: opt.name, association: association.relationName, targetKey: association.targetKey, targetModel: association.targetModel});
            }
          }
        }
      }
      //check
      if(!found) {
        errorsA.push({model: opt.name, association: association.relationName, targetModel: association.targetModel});
      }
    })
  });

  /**
   * Report errors if any && throws
   */
  //target model not found
  errorsA.forEach((e) => {
    console.log(colors.red('@@Error:'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- Association target model:', colors.yellow(e.targetModel), 'not found.');
  });
  //peer association not found
  errorsB.forEach((e) => {
    console.log(colors.red('@@Error:'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- Peer association on target key:', colors.yellow(e.targetKey), 'not found on target model:', colors.yellow(e.targetModel));
  });
  //throws if there is any error
  if(errorsA.length > 0 || errorsB.length > 0) {
    throw new Error("Inconsistent association definition");
  }
}

/**
 * addExtraAttributesAssociations - Adds extra attributes to each association defined on each model.
 *
 * @param  {array} opts Array of already calculated EJS options.
 */
exports.addExtraAttributesAssociations = function(opts) {
  //for each model
  opts.forEach( (opt) => {
    //for each association
    opt.sortedAssociations.forEach( (association, aindex, aarray) => {
      //find target model
      let found = false;
      for(let i=0; !found && i<opts.length; i++) {
        if(association.targetModel === opts[i].name) {
          found = true;
          
          /**
           * Add extra attributes: 
           */
          //set internalId
          association.internalId = opts[i].internalId;
          //set internalIdType
          association.internalIdType = opts[i].internalIdType;
          //set isDefaultId
          association.isDefaultId = opts[i].isDefaultId;
          //set paginationType
          association.paginationType = opts[i].paginationType;
          
        }
      }
    })
  });
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
 * attributesWithoutTargetKeysArrayFromFile - Given a object containing attributes description, 
 * this function will convert it to an array of arrays, where each item is as array with field 
 * name and its type (example [ [ 'name','string' ], [ 'is_human','boolean' ] ]).
 * Own target keys given on @ownTargetKeys will be excluded.
 *
 * @param  {object} attributes Object with keys the name of the field and value its type.
 * @param  {object} attrownTargetKeysibutes Object with keys the name of the field and value its type.
 * @return {array}  Array of arrays, where each item is as array with field name and its type 
 * (example [ [ 'name','string' ], [ 'is_human','boolean' ] ]).
 */
attributesWithoutTargetKeysArrayFromFile = function(attributes, ownTargetKeys){
  let attArray = []

  for(attr in attributes){
    if(!ownTargetKeys.includes(attr))
    {
      attArray.push([ attr, attributes[attr] ]);
    }
  }
  return attArray;
}

/**
 * parseAssociationsFromFile - Parse associations description for a given model
 *
 * @param  {object} fileData    Object parsed from a model JSON file definition.
 * @return {object}             Associations classified as 'belongsTos' and 'hasManys'. Each association will contain all extra information required by the tamplatees views.
 */
parseAssociationsFromFile = function(fileData){
  //check
  checkAssociations(fileData); // !throws on error
 
  let associations = fileData.associations;
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
      let sqlType = getSqlType(association, name);

      //base association attributes
      let baa = {
        "type" : type,
        "sqlType" : sqlType,

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
          baa.targetKey = association.targetKey;
          break;

        case "hasOne":
          baa.foreignKey = association.targetKey;
          baa.targetKey = association.targetKey;
          if(association.keyIn === fileData.model) {
            assoc.hasOwnForeingKeys = true;
            assoc.ownForeignKeysArr.push(association.targetKey);
          }
          break;

        case "belongsToMany":
          baa.keysIn = association.keysIn;
          break;

        case "hasMany":
          baa.foreignKey = association.targetKey;
          baa.targetKey = association.targetKey;
          break;

        case "generic":
          break;

        default:
          //unknown type
          console.log(colors.red('@@@@Error on association:'), colors.blue(name), '- Association has insconsistent key attributes.');
          throw new Error("Inconsistent attributes found");
      }

      if(type==='to_one' || type==='generic_to_one'){
        assoc.belongsTos.push(baa);
        assoc.sortedAssociations.push(baa);
      }else if(type==="to_many" || type==="to_many_through_sql_cross_table" || type==='generic_to_many'){
        assoc.hasManys.push(baa);
        assoc.sortedAssociations.push(baa);
        assoc.hasToManyAssociations = true;
      }else{
        //unknown type
        console.log(colors.red('Error: '), "Association type:", colors.dim(association.type), colors.yellow("not supported"));
        throw new Error("Invalid attributes found");
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

/**
 * getInternalId - Check whether an attribute "internalId" is given in the JSON model. If not the standard "id" is used instead.
 *
 * @param  {object} jsonModel object originally created from a json file containing data model info.
 * @return {string} Name of the attribute that functions as an internalId
 */
getInternalId = function(jsonModel){
  return (jsonModel.internalId) ? jsonModel.internalId : 'id';
}

/**
 * getInternalIdType - Check whether an attribute "internalId" is given in the JSON model and returns its type. If not the type of standard "id" is returned instead.
 *
 * @param  {object} jsonModel object originally created from a json file containing data model info.
 * @return {string} Name of the attribute that functions as an internalId
 */
getInternalIdType = function(jsonModel){
  return (jsonModel.internalId) ? jsonModel.attributes[jsonModel.internalId] : 'Int';
}

/**
 * getPaginationType - Check whether an the attribute "paginationType" is given in the JSON model and returns its type. If not the type of standard "id" is returned instead.
 *
 * @param  {object} jsonModel object originally created from a json file containing data model info.
 * @return {string} Either 'limitOffset' or 'cursorBased' as appropriate for the given model.
 */
getPaginationType = function(jsonModel){
  //sql
  if(String(jsonModel.storageType).toLowerCase() === 'sql') {
    return (jsonModel.paginationType) ? jsonModel.paginationType : 'cursorBased';
  } else {
    //non-sql
    return 'cursorBased';
  }
}

/**
 * checkAssociations - Validate association type.
 *
 * @param  {object} fileData Object parsed from a model JSON file definition.
 */
checkAssociations = function(fileData){
  let associations = fileData.associations;

  //check: undefined
  if(associations === undefined) return;

  //check: typeof
  if(typeof associations !== 'object') {
    //error: invalid type
    console.log(colors.red('@@@@Error:'), "Invalid type of model's attribute:", colors.dim('associations'), "Expected an object but got:", colors.dim(typeof associations));
    throw new Error("Invalid attributes found");
  }
  
  Object.entries(associations).forEach( ([name, association]) =>{

    /**
     * Attribute: association.type
     */

    //check: typeof
    if(typeof association.type !== 'string') {
      //error: invalid type
      console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Invalid association attribute:", colors.dim('type'), "Expected an string but got:", colors.dim(typeof association.type));
      throw new Error("Invalid attributes found");
    }
    
    //check: value
    switch(association.type.toLowerCase()) {
      //adapters
      case 'to_one':
      case 'to_many':
      case 'to_many_through_sql_cross_table':
      case 'generic_to_one':
      case 'generic_to_many':
        //ok
        break;

      default:
        //error: unknown type
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), '- Association type:', colors.dim(association.type), colors.yellow("not supported"), 'One of the following types is expected: [to_one, to_many, to_many_through_sql_cross_table, generic_to_one, generic_to_many].');
        throw new Error("Invalid attributes found");
    }

    //case: to_many_through_sql_cross_table
    if(association.type === 'to_many_through_sql_cross_table'){

      //check: only sql
      if(fileData.storageType.toLowerCase() !== 'sql' || association.targetStorageType !== 'sql') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "only allowed for relational database (sql) types with well defined cross-table");
        throw new Error("Inconsistent attributes found");
      }

      //check: required attribute
      if(association.sourceKey === undefined || typeof association.sourceKey !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("sourceKey"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute
      if(association.keysIn === undefined || typeof association.keysIn !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("keysIn"), "and should be a string.");
        throw new Error("Required attributes not found");
      }
    }
  });
}

/**
 * getSqlType - Calculates the type of relation of the given association, in terms of Sequelize concepts.
 *
 * @param  {object} association Association attributes (already calculated).
 * @param  {string} name Association's name.
 */
getSqlType = function(association, name){
  if(association.type === 'to_one' && association.keyIn !== association.target){
    return 'belongsTo';
  }else if(association.type === 'to_one' && association.keyIn === association.target){
    return 'hasOne';
  }else if(association.type === 'to_many_through_sql_cross_table'){
    return 'belongsToMany';
  }else if(association.type === 'to_many' && association.keyIn === association.target){
    return 'hasMany';
  }else if(association.type === 'generic_to_one' || association.type === 'generic_to_many'){
    return 'generic';
  }else{
    //error
    console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "has inconsistent key attributes.");
    throw new Error("Required attributes not found");
  }
}

/**
 * getWithPlotly - Calculates the value for withPlotly option.
 *
 * @param  {object} plotlyOptions Plotly related options.
 * @param  {string} filePath JSON model file path.
 */
getWithPlotly = function(plotlyOptions, filePath) {
  //check
  if(!plotlyOptions) return false;

  //check: genPlotlyForAll
  if(plotlyOptions.genPlotlyForAll) return true;

  //check: genPlotly
  if(plotlyOptions.genPlotly) {
    //get resolved paths
    let modelsWithPlotlyPaths = plotlyOptions.modelsWithPlotly.map((file) => path.resolve(file));

    if(modelsWithPlotlyPaths.includes(path.resolve(filePath))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * genPlotlyInExistentSpa - Generate Plotly JS React components on an existent 
 * Cenzontle SPA project.
 *
 * @param  {object} plotlyOptions Plotly related options.
 * @param  {boolean} verbose Verbose option.
 */
exports.genPlotlyInExistentSpa = async function(plotlyOptions, verbose) {
  let spaPlotlyDir = plotlyOptions.spaPlotlyDir;
  let modelsWithPlotly = plotlyOptions.modelsWithPlotly;
  let outputDir = path.resolve(path.join(spaPlotlyDir, 'src/components/plots'));

  //msgs
  console.log('Output directory:', colors.dim(path.resolve(outputDir)));
  console.log('Plotly options:', colors.dim(JSON.stringify(plotlyOptions, null, 4)));

  /**
   * Check: required directories
   */
  let requiredDirs=
    [
      path.resolve(spaPlotlyDir),
      path.join(spaPlotlyDir, 'src'),
      path.join(spaPlotlyDir, 'src/components'),
      path.join(spaPlotlyDir, 'src/components/plots'),
    ];
  let status = checkRequiredDirs(requiredDirs, false, null, true);
  //check
  if(status.allRequiredDirsExists || status.allRequiredDirsCreated) {
    //msg
    console.log(colors.white('@ ', colors.green('done')));
  } else {
    //msg
    console.log(colors.red('! Error: '), 'Some required directories does not exists.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  }

  /**
   * Parse JSON model files
   */
  //set: parse Plotly options
  let parsePlotlyOptions = {
    genPlotlyForAll: false,
    genPlotly: true,
    modelsWithPlotly,
  }
  status = parseJsonModels(modelsWithPlotly, null, {plotlyOptions: parsePlotlyOptions}, verbose);
  //check
  let opts = status.opts;
  if(opts.length === 0) {
    //msg
    console.log(colors.red('! Error: '), 'No JSON files could be processed.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  } else {
    //msg
    console.log("@ ", colors.green('done'));
  }

  /*
   * Code generation
   */
  //msg
  console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(outputDir))), "\n");
  
  for(let i=0; i<opts.length; i++) {
    let ejbOpts = opts[i];

    /**
     * modelPlotly
     * 
     * */
    // template 63: ModelPlotly
    fpath = path.resolve(outputDir, `${ejbOpts.nameCp}Plotly.js`);
    await exports.renderToFileSync(fpath, 'plots/ModelPlotly', ejbOpts);

    //msg
    console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
  }
}

exports.genStandalonePlotly = async function(plotlyOptions, verbose) {
  let standalonePlotlyBaseDir = plotlyOptions.standalonePlotlyBaseDir;
  let modelsWithPlotly = plotlyOptions.modelsWithPlotly;
  let outputDir = path.resolve(path.join(standalonePlotlyBaseDir, 'src/components/plots'));

  //msgs
  console.log('Output directory:', colors.dim(path.resolve(outputDir)));
  console.log('Plotly options:', colors.dim(JSON.stringify(plotlyOptions, null, 4)));

  /**
   * Check: required directories
   */
  let requiredDirs=
    [
      path.resolve(standalonePlotlyBaseDir),
      path.join(standalonePlotlyBaseDir, 'src'),
      path.join(standalonePlotlyBaseDir, 'src/components'),
      path.join(standalonePlotlyBaseDir, 'src/components/plots'),
    ];
  let status = checkRequiredDirs(requiredDirs, true, null, true);
  //check
  if(status.allRequiredDirsExists || status.allRequiredDirsCreated) {
    //msg
    console.log(colors.white('@ ', colors.green('done')));
  } else {
    //msg
    console.log(colors.red('! Error: '), 'Some required directories does not exists.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  }

  /**
   * Parse JSON model files
   */
  //set: parse Plotly options
  let parsePlotlyOptions = {
    genPlotlyForAll: false,
    genPlotly: true,
    modelsWithPlotly,
    standalonePlotly: true,
  }
  status = parseJsonModels(modelsWithPlotly, null, {plotlyOptions: parsePlotlyOptions}, verbose);
  //check
  let opts = status.opts;
  if(opts.length === 0) {
    //msg
    console.log(colors.red('! Error: '), 'No JSON files could be processed.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  } else {
    //msg
    console.log("@ ", colors.green('done'));
  }

  /*
   * Code generation
   */
  //msg
  console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(outputDir))), "\n");
  
  for(let i=0; i<opts.length; i++) {
    let ejbOpts = opts[i];

    /**
     * modelPlotly
     * 
     * */
    // template 63: ModelPlotly
    fpath = path.resolve(outputDir, `${ejbOpts.nameCp}Plotly.js`);
    await exports.renderToFileSync(fpath, 'plots/ModelPlotly', ejbOpts);

    //msg
    console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
  }
}


checkRequiredDirs = function(requiredDirs, createDirs, baseDir, verbose) {
  /*
   * Check: required directories
   */
  let allRequiredDirsExists = true;
  let allRequiredDirsCreated = true;
  
  //msg
  console.log(colors.white('\n@ Checking required directories...'));
  
  let baseDirectory = (baseDir) ? baseDir : "";
  for(var i=0; i<requiredDirs.length; ++i) {
    let dir = path.resolve(path.join(baseDirectory, requiredDirs[i]));
    if (fs.existsSync(dir)) {
      //msg
      if(verbose) console.log('@@ dir: ', colors.dim(dir), "... ", colors.green('ok') );
    } else {
      allRequiredDirsExists = false;
      //msg
      console.log('@@ dir: ', colors.dim(dir), "... ", colors.red('does not exist') );

      //create dir
      if(createDirs) {
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

  return {
    allRequiredDirsExists,
    allRequiredDirsCreated,
  };
}

parseJsonModels = function(jsonFiles, baseDir, {plotlyOptions}, verbose) {
  let opts = [];
  let totalFiles = 0;         //files readed from input dir
  let totalExcludedFiles = 0; //files excluded: either by JSON error parsing or by semantic errors.
  let totalWrongFiles = 0;    //files with semantic errors.

  //msg
  console.log(colors.white('\n@ Processing JSON files...'));

  //for each json model file
  for(let i=0; i<jsonFiles.length; i++) {
    let jsonFile = jsonFiles[i];
    let fileData = null;
    let jsonFilePath = baseDir ? path.resolve(path.join(baseDir,jsonFile)) : path.resolve(jsonFile);
    totalFiles++;

    //check: file
    if(fs.existsSync(jsonFilePath)) {
      //msg
      if(verbose) console.log('@@ file: ', colors.dim(jsonFilePath), "... ", colors.green('ok') );
    } else {
      totalExcludedFiles++;
      //msg
      console.log('@@ file: ', colors.dim(jsonFilePath), "... ", colors.red('does not exist') );
      continue;
    }

    //Parse JSON file
    try {
      fileData = funks.parseFile(jsonFilePath);
      //check
      if(fileData === null) {
        totalExcludedFiles++;
        //msg
        console.log('@@@ File:', colors.blue(jsonFile), colors.yellow('excluded'));
        continue;
      }
    } catch(e) {
      totalExcludedFiles++;
      //msg
      console.log(e);
      console.log('@@@ File:', colors.blue(jsonFile), colors.yellow('excluded'));
      continue;
    }
    
    //msg
    if(verbose) console.log("@@ Processing model in: ", colors.blue(jsonFile));
    
    //do semantic validations
    let check_json_model = funks.checkJsonDataFile(fileData);
    if(!check_json_model.pass) {//no-valid
      totalWrongFiles++;
      totalExcludedFiles++;

      //errors
      console.log("@@@ Error on model: ", colors.blue(jsonFile));
      check_json_model.errors.forEach( (error) =>{
        console.log("@@@", colors.red(error));
      });
      //msg
      console.log('@@@ File:', colors.blue(jsonFile), colors.yellow('excluded'));
      continue;

    } else { //first phase of semantic validations: ok
      
      //get options
      let opt = null;
      try {
        opt = funks.fillOptionsForViews(fileData, jsonFilePath, {plotlyOptions});
      }catch(e) {
        totalWrongFiles++;
        totalExcludedFiles++;
        //err
        console.log(colors.red("@@@ Error on model:"), colors.blue(fileData.model));
        console.log(e);
        //msg
        console.log('@@@ File:', colors.blue(jsonFile), colors.yellow('excluded'));
        continue;
      }

      //msg
      if(verbose) console.log("@@ ", colors.green('done'));
      opts.push(opt);
    }
  }

  //msg
  console.log("@@ Total JSON files processed: ", colors.blue(totalFiles));
  //msg
  console.log("@@ Total JSON files excluded: ", (totalExcludedFiles>0) ? colors.yellow(totalExcludedFiles) : colors.green(totalExcludedFiles));
  //msg
  console.log("@@ Total models with errors: ", (totalWrongFiles>0) ? colors.red(totalWrongFiles) : colors.green(totalWrongFiles));

  return {
    opts,
    totalFiles,
    totalWrongFiles,
    totalExcludedFiles,
  };
}
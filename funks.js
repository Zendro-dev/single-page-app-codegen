exports = module.exports = {};
const fs = require('fs-extra');
const path = require('path');
const inflection = require('inflection')
const {promisify} = require('util');
const ejsRenderFile = promisify( ejs.renderFile )
const colors = require('colors/safe');
const { first, template } = require('lodash');

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
 * @param  {object} status       Object with status properties. This function will set status properties on this object.
 * @param  {boolean} verbose     Verbose option.
 * @return {promise}             Promise will be resolved with success message if the file is written successfully, rejected with error otherwise.
 */
exports.renderToFileSync = async function(outFile, templateName, options, status, verbose) {
  let errorOnRender = false;
  
  //generate
  let genFile = await exports.renderTemplate(templateName, options)
  .catch((e) => {
    //flag
    errorOnRender = true;
    //error msg
    console.log('@@@ Template:', colors.dim(templateName), 'with error.');
    console.log(e);
  });
  
  //write
  if(!errorOnRender) {
    try {
      fs.writeFileSync(outFile, genFile);
      //success
      if(verbose) console.log('@@@ File:', colors.dim(outFile), colors.green('written successfully!'));
    } catch(e) {
      errorOnRender = true;
      //error msg
      console.log('@@@ File:', colors.dim(outFile), ', error trying to write in file.');
      console.log(e);
    }
  }

  //check
  if(errorOnRender && status && typeof status === 'object') {
    //set status
    status.errorOnRender = true;
    if(typeof status.totalCodeGenerationErrors === 'number'){
      status.totalCodeGenerationErrors++;
    }
    if(status.templatesWithErrors 
    && Array.isArray(status.templatesWithErrors)
    && !status.templatesWithErrors.includes(templateName)) {
      status.templatesWithErrors.push(templateName);
    }

  } else {
    if(typeof status.totalFilesGenerated === 'number'){
      status.totalFilesGenerated++;
    }
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
        case 'zendro-webservice-adapter':
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
    result.errors.push(`ERROR: There are no JSON files on input directory. You should specify some JSON files in order to generate the Zendro SPA.`);
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
        case 'zendro-server':
        case 'generic':
        //adapters
        case 'sql-adapter':
        case 'ddm-adapter':
        case 'zendro-webservice-adapter':
        case 'generic-adapter':
        //ok
        break;
        
        default:
          //not ok
          result.pass = false;
          result.errors.push(`ERROR: The attribute 'storageType' has an invalid value. One of the following types is expected: [sql, zendro-server, distributed-data-model, generic]. But '${jsonModel.storageType}' was obtained.`);
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
        for(let i=0; i<keys.length; ++i) {
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
 * addKeyRelationName - Adds 'keyRelationName' name-attributes to each association defined on each model.
 * This key name is a unique name that identifies a relation between two models and is composed as follows:
 * 
 * Case: to_many || to_one:
 *      <keyIn>_<targetKey>
 * 
 * Case: to_many_through_sql_cross_table:
 *      <keysIn>
 * 
 * Case: generic_to_one || generic_to_many
 *      <modelName>_<relationName>
 *
 * @param  {array} opts Array of already calculated EJS model options.
 */
exports.addKeyRelationName = function(opts) {
  let warningsA = []; //target model not found
  let warningsB = []; //peer association not found
  let errorsA = []; //check A: keyIn should be the same in both peers
  let errorsB = []; //check B: association type: should be to_one || to_many
  let errorsC = []; //check C: peerA.model should be = peerB.targetModel
  let errorsD = []; //check D: peerA.targetKey should be = peerB.sourceKey
  let errorsE = []; //check E: peerA.sourceKey should be = peerB.targetKey
  
  //for each model
  opts.forEach( (opt) => {
    
    //for each association
    opt.sortedAssociations.forEach( (association) => {

      /**
       * Set keyRelationName attribute.
       */
      if(association.type === 'to_one' || association.type === 'to_many') {
        association.keyRelationName = association.keyIn+'_'+association.targetKey;
      } else if(association.type === 'to_many_through_sql_cross_table') {
        association.keyRelationName = association.keysIn;
      } else if(association.type === 'generic_to_one' || association.type === 'generic_to_many') {
        association.keyRelationName = opt.name+'_'+association.relationName;
      }       

      /**
       * Checks
       * - Target model
       * - Peer relation
       * - Unique <keyIn> + <targetKey>
       * - Unique <keysIn>
       */
      //find target model
      let foundTargetModel = false;
      for(let i=0; i<opts.length && !foundTargetModel; i++) {
        
        /**
         * Case: target model found
         */
        if(association.targetModel === opts[i].name) {
          foundTargetModel = true;

          //find peer association
          let foundPeerAssociation = false;
          for(let j=0; j<opts[i].sortedAssociations.length && !foundPeerAssociation; j++) {
            
            if(association.type === 'to_one' || association.type === 'to_many') {
              
              /**
               * Case: peer association found
               */
              if(opts[i].sortedAssociations[j].targetModel === opt.name
              && opts[i].sortedAssociations[j].targetKey === association.targetKey) {
                foundPeerAssociation = true;

                //check A: keyIn should be the same in both peers
                if(opts[i].sortedAssociations[j].keyIn !== association.keyIn) {
                  //error
                  errorsA.push({
                    model: opt.name, 
                    association: association.relationName, 
                    targetKey: association.targetKey, 
                    keyIn: association.keyIn, 
                    targetModel: association.targetModel, 
                    peerAssociationName: opts[i].sortedAssociations[j].relationName,
                    peerAssociationKeyIn: opts[i].sortedAssociations[j].keyIn,
                  });
                }

                //check B: association type: should be to_one || to_many
                if(opts[i].sortedAssociations[j].type !== 'to_one' && opts[i].sortedAssociations[j].type !== 'to_many') {
                  //error
                  errorsB.push({
                    model: opt.name, 
                    association: association.relationName, 
                    targetKey: association.targetKey,
                    type: association.type, 
                    targetModel: association.targetModel, 
                    peerAssociationName: opts[i].sortedAssociations[j].relationName,
                    peerAssociationType: opts[i].sortedAssociations[j].type,
                  });
                }
              }//else: nothing to check

            } else if(association.type === 'to_many_through_sql_cross_table') {
              
              /**
               * Case: same keysIn found
               */
              if(opts[i].sortedAssociations[j].keysIn === association.keysIn) {
                foundPeerAssociation = true;

                /**
                 * Check: crossed attributes
                 * 
                 * (C) peerA.model        should be = peerB.targetModel
                 * (D) peerA.targetKey    should be = peerB.sourceKey
                 * (E) peerA.sourceKey    should be = peerB.targetKey
                 */
                if(opts[i].sortedAssociations[j].targetModel !== opt.name) {
                  //error: on check: (C)
                  errorsC.push({
                    model: opt.name, 
                    association: association.relationName, 
                    targetKey: association.targetKey, 
                    keysIn: association.keysIn, 
                    targetModel: association.targetModel, 
                    peerAssociationName: opts[i].sortedAssociations[j].relationName,
                    peerAssociationTargetModel: opts[i].sortedAssociations[j].targetModel,
                  });
                }
                if(opts[i].sortedAssociations[j].sourceKey !== association.targetKey) {
                  //error: on check: (D)
                  errorsD.push({
                    model: opt.name, 
                    association: association.relationName, 
                    targetKey: association.targetKey, 
                    keysIn: association.keysIn, 
                    targetModel: association.targetModel, 
                    peerAssociationName: opts[i].sortedAssociations[j].relationName,
                    peerAssociationSourceKey: opts[i].sortedAssociations[j].sourceKey,
                  });
                }
                if(opts[i].sortedAssociations[j].targetKey !== association.sourceKey) {
                  //error: on check: (E)
                  errorsE.push({
                    model: opt.name, 
                    association: association.relationName, 
                    sourceKey: association.sourceKey, 
                    keysIn: association.keysIn, 
                    targetModel: association.targetModel, 
                    peerAssociationName: opts[i].sortedAssociations[j].relationName,
                    peerAssociationTargetKey: opts[i].sortedAssociations[j].targetKey,
                  });
                }
              }//end: Case: same keysIn found
            }
          }//end: for each association on target model: find peer

          //check
          if(!foundPeerAssociation) {
            warningsB.push({model: opt.name, association: association.relationName, targetKey: association.targetKey, targetModel: association.targetModel});
          }

        }//end: Case: target model found

      }//end: for each model: find target model
      //check
      if(!foundTargetModel) {
        warningsA.push({model: opt.name, association: association.relationName, targetModel: association.targetModel});
      }
    }); //end: for each association: add keyRelationName & do checks.
  }); //end: for each model: add keyRelationName & do checks on each association.

  /**
   * Report warnings.
   * Report & throw errors.
   */
  //target model not found
  warningsA.forEach((e) => {
    console.log(colors.yellow('@@Warning: Incomplete association definition'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- Association target model:', colors.yellow(e.targetModel), 'not found.');
  });
  //peer association not found
  warningsB.forEach((e) => {
    console.log(colors.yellow('@@Warning: Incomplete association definition'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- Peer association on target key:', colors.yellow(e.targetKey), 'not found on target model:', colors.yellow(e.targetModel));
  });
  //errorsA: keyIn should be the same in both peers
  errorsA.forEach((e) => {
    console.log(colors.yellow('@@Error: Incorrect association definitions peer'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- <keyIn> attribute should be the same in an associaton definitions peer, but got: <keyIn>:', colors.blue(e.keyIn), 'with: <keyIn>:', colors.yellow(e.peerAssociationKeyIn), 'in peer:', colors.yellow(e.targetModel+'-'+e.peerAssociationName));
  });
  //errorsB: association type: should be to_one || to_many
  errorsB.forEach((e) => {
    console.log(colors.yellow('@@Error: Incorrect association definitions peer'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- <association.type> should be <to_one> || <to_many> in peer associaton definition, but got: <type>:', colors.blue(e.type), 'with: <type>:', colors.yellow(e.peerAssociationType), 'in peer:', colors.yellow(e.targetModel+'-'+e.peerAssociationName));
  });

  //errorsC: peerA.model should be = peerB.targetModel
  errorsC.forEach((e) => {
    console.log(colors.yellow('@@Error: Incorrect association definitions peer'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), '- <targetModel> in peer association should be equal to this <modelName>, but got: <targetModel>:', colors.yellow(e.peerAssociationTargetModel), 'in peer:', colors.yellow(e.targetModel+'-'+e.peerAssociationName));
  });

  //errorsD: peerA.targetKey should be = peerB.sourceKey
  errorsD.forEach((e) => {
    console.log(colors.yellow('@@Error: Incorrect association definitions peer'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), 'with <targetKey>:', colors.blue(e.targetKey), '- <sourceKey> in peer association should be equal to <targetKey> in this association, but got: <sourceKey>:', colors.yellow(e.peerAssociationSourceKey), 'in peer:', colors.yellow(e.targetModel+'-'+e.peerAssociationName));
  });

  //errorsE: peerA.sourceKey should be = peerB.targetKey
  errorsE.forEach((e) => {
    console.log(colors.yellow('@@Error: Incorrect association definitions peer'), 'on model:', colors.blue(e.model), 'on associaton:', colors.blue(e.association), 'with <sourceKey>:', colors.blue(e.sourceKey), '- <targetKey> in peer association should be equal to <sourceKey> in this association, but got: <targetKey>:', colors.yellow(e.peerAssociationTargetKey), 'in peer:', colors.yellow(e.targetModel+'-'+e.peerAssociationName));
  });
 
  //throws if there is any error
  if(errorsA.length > 0 || errorsB.length > 0 || errorsC.length > 0 || errorsD.length > 0 || errorsE.length > 0) {
    throw new Error("Incorrect association definition");
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
          baa.keyIn = association.keyIn;
          break;

        case "hasOne":
          baa.foreignKey = association.targetKey;
          baa.targetKey = association.targetKey;
          baa.keyIn = association.keyIn;
          if(association.keyIn === fileData.model) {
            assoc.hasOwnForeingKeys = true;
            assoc.ownForeignKeysArr.push(association.targetKey);
          }
          break;

        case "belongsToMany":
          baa.keysIn = association.keysIn;
          baa.sourceKey = association.sourceKey;
          baa.targetKey = association.targetKey;
          break;

        case "hasMany":
          baa.foreignKey = association.targetKey;
          baa.targetKey = association.targetKey;
          baa.keyIn = association.keyIn;
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
  let attributes = fileData.attributes;
  let modelName = fileData.model;
  let ownTargetKeys = {};
  let ownCrossTables = {};

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

    /**
     * Case:
     * <to_one> || <to_many> 
     */
    if(association.type === 'to_one' || association.type === 'to_many') {

      //check: required attribute: target
      if(association.target === undefined || typeof association.target !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("target"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: targetKey
      if(association.targetKey === undefined || typeof association.targetKey !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("targetKey"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: targetStorageType
      if(association.targetStorageType === undefined || typeof association.targetStorageType !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("targetStorageType"), "and should be a string.");
        throw new Error("Required attributes not found");
      }
      
      //check: required attribute: keyIn
      if(association.keyIn === undefined || typeof association.keyIn !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("keyIn"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //if has targetKey
      if(association.keyIn === modelName) {

        //update targetKey count
        if(!ownTargetKeys[association.targetKey]) ownTargetKeys[association.targetKey] = 1;
        else ownTargetKeys[association.targetKey]++;

        //check: consistency definition: targetKey
        if(!attributes.hasOwnProperty(association.targetKey)) {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined the value of", colors.dim("targetKey"), "as an attribute of this model, but", colors.yellow(association.targetKey), "is not declared as an attribute.");
        throw new Error("Inconsistent attributes found");
        }
      }
    }

    /**
     * Case:
     * <to_many_through_sql_cross_table> 
     */
    if(association.type === 'to_many_through_sql_cross_table'){

      //check: required attribute: target
      if(association.target === undefined || typeof association.target !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("target"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: targetKey
      if(association.targetKey === undefined || typeof association.targetKey !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("targetKey"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: sourceKey
      if(association.sourceKey === undefined || typeof association.sourceKey !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("sourceKey"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: targetStorageType
      if(association.targetStorageType === undefined || typeof association.targetStorageType !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("targetStorageType"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: required attribute: keysIn
      if(association.keysIn === undefined || typeof association.keysIn !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("keysIn"), "and should be a string.");
        throw new Error("Required attributes not found");
      }

      //check: only sql
      if(fileData.storageType.toLowerCase() !== 'sql') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "only allowed for relational database (sql) types with well defined cross-table, but got 'storageType':", colors.red(fileData.storageType.toLowerCase()));
        throw new Error("Inconsistent attributes found");
      }

      if(association.targetStorageType.toLowerCase() !== 'sql') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "only allowed for relational database (sql) types with well defined cross-table, but got 'targetStorageType':", colors.red(association.targetStorageType.toLowerCase()));
        throw new Error("Inconsistent attributes found");
      }

      //update targetKey count
      if(!ownCrossTables[association.keysIn]) ownCrossTables[association.keysIn] = 1;
      else ownCrossTables[association.keysIn]++;
    }

    /**
     * Case:
     * <generic_to_one> || <generic_to_many> 
     */
    if(association.type === 'generic_to_one' || association.type === 'generic_to_many'){

      //check: required attribute: target
      if(association.target === undefined || typeof association.target !== 'string') {
        //error
        console.log(colors.red('@@@@Error on association:'), colors.blue(name), "- Association type:", colors.dim(association.type), "should have defined attribute", colors.dim("target"), "and should be a string.");
        throw new Error("Required attributes not found");
      }
    }
  });
  

  /**
   * Check: unique target keys
   */
  Object.entries(ownTargetKeys).forEach((entry) => {
    if(entry[1] > 1) {
      //error
      console.log(colors.red('@@@@Error on model:'), colors.blue(modelName), "- target keys should be unique for each association, but", colors.dim(entry[0]), "is used in",entry[1], "different associations as target key.");
      throw new Error("Inconsistent attributes found");
    }
  });

  /**
   * Check: cross tables
   */
  Object.entries(ownCrossTables).forEach((entry) => {
    if(entry[1] > 1) {
      //error
      console.log(colors.red('@@@@Error on model:'), colors.blue(modelName), "- cross tables should be unique for each many-to-many association, but", colors.dim(entry[0]), "is used in",entry[1], "different associations, as the value of 'keysIn' attribute.");
      throw new Error("Inconsistent attributes found");
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
 * Zendro SPA project.
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
    //print summary
    exports.printSummary(status);
    //msg
    console.log(colors.red('! Error: '), 'No JSON files could be processed.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  } else {
    if(status.totalWrongFiles > 0){
      //msg
      console.log("@ ", colors.red('done'));
    } else {
      //msg
      console.log("@ ", colors.green('done'));
    }
  }

  /*
   * Code generation
   */
  //msg
  console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(outputDir))), "\n");
  
  status.totalFilesGenerated = 0;
  status.totalCodeGenerationErrors = 0;
  status.templatesWithErrors = [];

  for(let i=0; i<opts.length; i++) {
    let ejbOpts = opts[i];
    status.errorOnRender = false;

    /**
     * modelPlotly
     * 
     * */
    // template 63: ModelPlotly
    fpath = path.resolve(outputDir, `${ejbOpts.nameCp}Plotly.js`);
    await exports.renderToFileSync(fpath, 'plots/ModelPlotly', ejbOpts, status, verbose);

    if(status.errorOnRender) {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.red('done'));
    } else {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
    }
  }
  return status;
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
    //print summary
    exports.printSummary(status);
    //msg
    console.log(colors.red('! Error: '), 'No JSON files could be processed.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  } else {
    if(status.totalWrongFiles > 0){
      //msg
      console.log("@ ", colors.red('done'));
    } else {
      //msg
      console.log("@ ", colors.green('done'));
    }
  }

  /*
   * Code generation
   */
  //msg
  console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(outputDir))), "\n");
  
  status.totalFilesGenerated = 0;
  status.totalCodeGenerationErrors = 0;
  status.templatesWithErrors = [];
  
  for(let i=0; i<opts.length; i++) {
    let ejbOpts = opts[i];
    status.errorOnRender = false;

    /**
     * modelPlotly
     * 
     * */
    // template 63: ModelPlotly
    fpath = path.resolve(outputDir, `${ejbOpts.nameCp}Plotly.js`);
    await exports.renderToFileSync(fpath, 'plots/ModelPlotly', ejbOpts, status, verbose);
    if(status.errorOnRender) {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.red('done'));
    } else {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
    }
  }

  return status;
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
  for(let i=0; i<requiredDirs.length; ++i) {
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

  return {
    opts,
    totalFiles,
    totalWrongFiles,
    totalExcludedFiles,
  };
}

exports.printSummary = function(status) {

  //msg
  if(status.totalFiles !== undefined) console.log("\n@@ Total JSON files processed: ", colors.blue(status.totalFiles));
  //msg
  if(status.totalExcludedFiles !== undefined) console.log("@@ Total JSON files excluded: ", (status.totalExcludedFiles>0) ? colors.yellow(status.totalExcludedFiles) : colors.green(status.totalExcludedFiles));
  //msg
  if(status.totalWrongFiles !== undefined) console.log("@@ Total models with errors: ", (status.totalWrongFiles>0) ? colors.red(status.totalWrongFiles) : colors.green(status.totalWrongFiles));
  //msg
  if(status.totalFilesGenerated !== undefined) console.log("@@ Total files generated: ", (status.totalFilesGenerated>0) ? colors.green(status.totalFilesGenerated) : colors.yellow(status.totalFilesGenerated));
  //msg
  if(status.totalCodeGenerationErrors !== undefined) console.log("@@ Total code generation errors: ", (status.totalCodeGenerationErrors>0) ? colors.red(status.totalCodeGenerationErrors) : colors.green(status.totalCodeGenerationErrors));
  //msg
  if(status.templatesWithErrors !== undefined && Array.isArray(status.templatesWithErrors) && status.templatesWithErrors.length > 0){
    console.log("@@ Total templates with errors: ", colors.red(status.templatesWithErrors.length));
    console.log(colors.dim.red(status.templatesWithErrors));
  }
  console.log("\n@@", colors.dim('spa'));
}

/**
 * genSpa - Generate SPA JS React components. This is the main generation function.
 *
 * @param  {object} program Object with comand line options.
 */
exports.genSpa = async function(program, {plotlyOptions}) {
  /**
   * Set options
   */
  //ops: output/input directories
  let inputModelsDir = program.jsonFiles;
  let spaBaseDir = program.outputDir || __dirname;

  //op: verbose
  let verbose = program.verbose !== undefined ? true : false;

  //op: createBaseDirs
  let createBaseDirs = program.createBaseDirs !== undefined ? true : false;

  //op: genPlotlyForAll
  let genPlotlyForAll = program.genPlotlyForAll !== undefined ? true : false;

  //set: all Plotly options
  if(plotlyOptions && typeof plotlyOptions === 'object') {
    plotlyOptions.genPlotlyForAll = genPlotlyForAll;
  } else {
    plotlyOptions = {
      genPlotlyForAll,
      genPlotly: false,
      modelsWithPlotly: [],
    }
  }

  //msgs
  console.log('Input directory:', colors.dim(path.resolve(inputModelsDir)));
  console.log('Output directory:', colors.dim(path.resolve(spaBaseDir)));
  console.log('Plotly options:', colors.dim(JSON.stringify(plotlyOptions, null, 4)));

  /**
   * Check: required directories
   */
  let requiredDirs=
    [
      path.resolve(spaBaseDir),
      path.join(spaBaseDir, 'src'),
      path.join(spaBaseDir, 'src/components'),
    ];
  let status = checkRequiredDirs(requiredDirs, createBaseDirs, null, verbose);
  //check
  if(status.allRequiredDirsExists || status.allRequiredDirsCreated) {
    //msg
    console.log(colors.white('@ ', colors.green('done')));
  } else {
    //msg
    console.log(colors.red('! Error: '), 'Some required directories does not exists. Please use the option --createBaseDirs if you want them to be created.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  }

  /**
   * Read input models dir
   */
  let jsonModelsfiles = null;
  try {
    jsonModelsfiles = fs.readdirSync(inputModelsDir);
  } catch(e) {
    //msg
    console.log(colors.red('Error:'),'could not read directory:', colors.blue(inputModelsDir));
    console.log(e);
    process.exit(1);
  }

  /**
   * Semantic validations
   */
  let check_json_files = exports.checkJsonFiles(inputModelsDir, jsonModelsfiles, {plotlyOptions});
  if(!check_json_files.pass) {//no-valid
    //err
    console.log(colors.red("@@: Proccess", colors.red('canceled...')));
    //errors
    check_json_files.errors.forEach( (error) =>{
      console.log("@@@", colors.red(error));
    });
    //msg
    console.log("@ ", colors.red('done'));
    process.exit(1);
  } 

  /**
   * Parse JSON model files
   */
  status = parseJsonModels(jsonModelsfiles, inputModelsDir, {plotlyOptions}, verbose);
  //check
  let opts = status.opts;
  if(opts.length === 0) {
    //print summary
    exports.printSummary(status);
    //msg
    console.log(colors.red('! Error: '), 'No JSON files could be processed.');
    console.log(colors.white('@ ', colors.red('done')));
    process.exit(1);
  } else {
    if(status.totalWrongFiles > 0){
      //msg
      console.log("@ ", colors.red('done'));
    } else {
      //msg
      console.log("@ ", colors.green('done'));
    }
  }

  //add extra attributes
  try {
    exports.addKeyRelationName(opts);
    exports.addExtraAttributesAssociations(opts);

  }catch(e) {
    //err
    console.log(colors.red("@@: Code generation", colors.red('canceled...')));
    console.log(e);
    //msg
    console.log("@ Code generation: ", colors.red('done'));
    process.exit(1);
  }

  /*
   * Code generation
   */
  //msg
  console.log(colors.white('\n@ Starting code generation in: \n', colors.dim(path.resolve(spaBaseDir))), "\n");
  
  status.totalFilesGenerated = 0;
  status.totalCodeGenerationErrors = 0;
  status.templatesWithErrors = [];
  let modelsOpts = {models: [], adminModels: []};
  let modelAtts = {};
  let adminModels = ['role', 'user', 'role_to_user'];

  /**
   * For each model in opts
   */
  for(let i=0; i<opts.length; i++) {
    let ejbOpts = opts[i];

    // set table path & collect models
    let tablePath = null;
    if(adminModels.includes(ejbOpts.nameLc)) {
      tablePath = 'src/components/main-panel/table-panel/admin-tables';
      modelsOpts.adminModels.push(ejbOpts);
    } else {
      tablePath = 'src/components/main-panel/table-panel/models-tables';
      modelsOpts.models.push(ejbOpts);
    }
    //collect attributes
    modelAtts[ejbOpts.name] = ejbOpts.attributesArr;

    /*
     * Create required directories
     */
    //msg
    if(verbose) console.log(colors.white('\n@@ Creating required directories...'));
    //table
    let modelTableDirs = [
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`),
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`),
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`),
      path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components`),
    ]
    //associations
    for(let i=0; i<ejbOpts.sortedAssociations.length; i++)
    {
      let assocLc = ejbOpts.sortedAssociations[i].relationNameLc;
      modelTableDirs.push(path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-add-transfer-view/components`));
      modelTableDirs.push(path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-add-transfer-view/components`));
      if(ejbOpts.sortedAssociations[i].type === 'to_many' || ejbOpts.sortedAssociations[i].type === 'to_many_through_sql_cross_table' || ejbOpts.sortedAssociations[i].type === 'generic_to_many') {
        modelTableDirs.push(path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-transfer-lists/${assocLc}-to-remove-transfer-view/components`));
      }
      modelTableDirs.push(path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${assocLc}-compact-view/components`));
    }
    //routes
    modelTableDirs.push(path.resolve(spaBaseDir, 'src/routes'));
    //requests
    modelTableDirs.push(path.resolve(spaBaseDir, 'src/requests'));
    //plots
    let plotlyPath = 'src/components/plots';
    modelTableDirs.push(path.resolve(spaBaseDir, plotlyPath));

    //create dirs
    for(let i=0; i<modelTableDirs.length; i++) {
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
          console.log("@ ", colors.red('done'));
          process.exit(1);
        }
      } else {
        //msg
        if(verbose) console.log("@@@ dir exists: ", colors.dim(dir));
      }
    }
    //msg
    if(verbose)console.log("@@ ", colors.green('done'));

    /*
     * Generate code
     */
    status.errorOnRender = false;

    /**
     * modelTable
     * 
     * */
    // template 1: ModelEnhancedTable
    let fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/`, `${ejbOpts.nameCp}EnhancedTable.js`);
    await exports.renderToFileSync(fpath, 'model-table/ModelEnhancedTable', ejbOpts, status, verbose);

    // template 2: ModelUploadFileDialog
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}UploadFileDialog.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/ModelUploadFileDialog', ejbOpts, status, verbose);

    // template 3: ModelEnhancedTableToolbar
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}EnhancedTableToolbar.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/ModelEnhancedTableToolbar', ejbOpts, status, verbose);

    // template 4: ModelEnhancedTableHead
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}EnhancedTableHead.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/ModelEnhancedTableHead', ejbOpts, status, verbose);

    // template 5: ModelDeleteConfirmationDialog
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}DeleteConfirmationDialog.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/ModelDeleteConfirmationDialog', ejbOpts, status, verbose);

    // template 5_b: ModelCursorPagination
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/`, `${ejbOpts.nameCp}CursorPagination.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/ModelCursorPagination', ejbOpts, status, verbose);

    /**
     * modelTable - modelCreatePanel 
     * 
     * */

    // template 6: ModelCreatePanel
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/`, `${ejbOpts.nameCp}CreatePanel.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/ModelCreatePanel', ejbOpts, status, verbose);

    // template 7: ModelTabsA
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/`, `${ejbOpts.nameCp}TabsA.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/ModelTabsA', ejbOpts, status, verbose);

    // template 8: ModelConfirmationDialog
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/ModelConfirmationDialog', ejbOpts, status, verbose);

    /**
     * modelTable - modelCreatePanel - modelAttributes 
     * 
     * */

    // template 9: ModelAttributesPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts, status, verbose);

    // template 10: ModelAttributesFormView
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts, status, verbose);

    // template 11: BoolField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts, status, verbose);

    // template 12: DateField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts, status, verbose);

    // template 13: DateTimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts, status, verbose);

    // template 14: FloatField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts, status, verbose);

    // template 15: IntField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts, status, verbose);

    // template 16: StringField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts, status, verbose);

    // template 16_b: PasswordField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `PasswordField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/PasswordField', ejbOpts, status, verbose);

    // template 17: TimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts, status, verbose);

    /**
     * modelTable - modelCreatePanel - modelAssociations
     * 
     * */

    // template 18: ModelAssociationsPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts, status, verbose);

    // template 19: ModelAssociationsMenuTabs
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts, status, verbose);

    for(let i=0; i<ejbOpts.sortedAssociations.length; i++)
    {
      ejbOpts.aindex = i;

      // template 20: AssociationTransferLists
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/`, `${ejbOpts.sortedAssociations[i].relationNameCp}TransferLists.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/AssociationTransferLists', ejbOpts, status, verbose);

      // template 21: RecordsToAddTransferView
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferView.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/RecordsToAddTransferView', ejbOpts, status, verbose);

      // template 22: RecordsToAddTransferViewToolbar
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewToolbar.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewToolbar', ejbOpts, status, verbose);
    
      // template 22_b: RecordsToAddTransferViewCursorPagination
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-create-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewCursorPagination.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-create-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewCursorPagination', ejbOpts, status, verbose);
    }

    /**
     * modelTable - modelUpdatePanel 
     * 
     * */

    // template 23: ModelUpdatePanel
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/`, `${ejbOpts.nameCp}UpdatePanel.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/ModelUpdatePanel', ejbOpts, status, verbose);

    // template 24: ModelTabsA
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/`, `${ejbOpts.nameCp}TabsA.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/ModelTabsA', ejbOpts, status, verbose);

    // template 25: ModelConfirmationDialog
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/`, `${ejbOpts.nameCp}ConfirmationDialog.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/ModelConfirmationDialog', ejbOpts, status, verbose);

    /**
     * modelTable - modelUpdatePanel - modelAttributes 
     * 
     * */

    // template 26: ModelAttributesPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts, status, verbose);

    // template 27: ModelAttributesFormView
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts, status, verbose);

    // template 28: BoolField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts, status, verbose);

    // template 29: DateField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts, status, verbose);

    // template 30: DateTimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts, status, verbose);

    // template 31: FloatField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts, status, verbose);

    // template 32: IntField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts, status, verbose);

    // template 33: StringField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts, status, verbose);

    // template 33_b: PasswordField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `PasswordField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/PasswordField', ejbOpts, status, verbose);

    // template 34: TimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts, status, verbose);

    /**
     * modelTable - modelUpdatePanel - modelAssociations
     * 
     * */

    // template 35: ModelAssociationsPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts, status, verbose);

    // template 36: ModelAssociationsMenuTabs
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts, status, verbose);

    for(let i=0; i<ejbOpts.sortedAssociations.length; i++)
    {
      ejbOpts.aindex = i;

      // template 37: AssociationTransferLists
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/`, `${ejbOpts.sortedAssociations[i].relationNameCp}TransferLists.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/AssociationTransferLists', ejbOpts, status, verbose);

      // template 38: RecordsToAddTransferView
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferView.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/RecordsToAddTransferView', ejbOpts, status, verbose);

      // template 39: RecordsToAddTransferViewToolbar
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewToolbar.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewToolbar', ejbOpts, status, verbose);

      // template 39_b: RecordsToAddTransferViewCursorPagination
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-add-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToAddTransferViewCursorPagination.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-add-transfer-view/components/RecordsToAddTransferViewCursorPagination', ejbOpts, status, verbose);

      if(ejbOpts.sortedAssociations[i].type === 'to_many' || ejbOpts.sortedAssociations[i].type === 'to_many_through_sql_cross_table' || ejbOpts.sortedAssociations[i].type === 'generic_to_many') {
        // template 40: RecordsToRemoveTransferView
        fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferView.js`);
        await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/RecordsToRemoveTransferView', ejbOpts, status, verbose);

        // template 41: RecordsToRemoveTransferViewToolbar
        fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferViewToolbar.js`);
        await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/components/RecordsToRemoveTransferViewToolbar', ejbOpts, status, verbose);

        // template 41_b: RecordsToRemoveTransferViewCursorPagination
        fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-update-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-transfer-lists/${ejbOpts.sortedAssociations[i].relationNameLc}-to-remove-transfer-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}ToRemoveTransferViewCursorPagination.js`);
        await exports.renderToFileSync(fpath, 'model-table/components/model-update-panel/components/model-associations-page/association-transfer-lists/records-to-remove-transfer-view/components/RecordsToRemoveTransferViewCursorPagination', ejbOpts, status, verbose);
      }

    }

    /**
     * modelTable - modelDetailPanel 
     * 
     * */

    // template 42: ModelDetailPanel
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/`, `${ejbOpts.nameCp}DetailPanel.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/ModelDetailPanel', ejbOpts, status, verbose);

    /**
     * modelTable - modelDetailPanel - modelAttributes 
     * 
     * */

    // template 43: ModelAttributesPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/`, `${ejbOpts.nameCp}AttributesPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/ModelAttributesPage', ejbOpts, status, verbose);

    // template 44: ModelAttributesFormView
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/`, `${ejbOpts.nameCp}AttributesFormView.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/ModelAttributesFormView', ejbOpts, status, verbose);

    // template 45: BoolField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `BoolField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/BoolField', ejbOpts, status, verbose);

    // template 46: DateField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/DateField', ejbOpts, status, verbose);

    // template 47: DateTimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `DateTimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/DateTimeField', ejbOpts, status, verbose);

    // template 48: FloatField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `FloatField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/FloatField', ejbOpts, status, verbose);

    // template 49: IntField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `IntField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/IntField', ejbOpts, status, verbose);

    // template 50: StringField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `StringField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/StringField', ejbOpts, status, verbose);

    // template 50_b: PasswordField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `PasswordField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/PasswordField', ejbOpts, status, verbose);

    // template 51: TimeField
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-attributes-page/${ejbOpts.nameLc}-attributes-form-view/components/`, `TimeField.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-attributes-page/model-attributes-form-view/components/TimeField', ejbOpts, status, verbose);

    /**
     * modelTable - modelDetailPanel - modelAssociations
     * 
     * */

    // template 52: ModelAssociationsPage
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsPage.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/ModelAssociationsPage', ejbOpts, status, verbose);

    // template 53: ModelAssociationsMenuTabs
    fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/`, `${ejbOpts.nameCp}AssociationsMenuTabs.js`);
    await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/ModelAssociationsMenuTabs', ejbOpts, status, verbose);

    for(let i=0; i<ejbOpts.sortedAssociations.length; i++)
    {
      ejbOpts.aindex = i;

      // template 54: AssociationCompactView
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactView.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/AssociationCompactView', ejbOpts, status, verbose);

      // template 55: AssociationCompactViewToolbar
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactViewToolbar.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/components/AssociationCompactViewToolbar', ejbOpts, status, verbose);

      // template 55_b: AssociationCompactViewCursorPagination
      fpath = path.resolve(spaBaseDir, `${tablePath}/${ejbOpts.nameLc}-table/components/${ejbOpts.nameLc}-detail-panel/components/${ejbOpts.nameLc}-associations-page/${ejbOpts.sortedAssociations[i].relationNameLc}-compact-view/components/`, `${ejbOpts.sortedAssociations[i].relationNameCp}CompactViewCursorPagination.js`);
      await exports.renderToFileSync(fpath, 'model-table/components/model-detail-panel/components/model-associations-page/association-compact-view/components/AssociationCompactViewCursorPagination', ejbOpts, status, verbose);

    }

    /**
     * modelPlotly
     * 
     * */
    // template 63: ModelPlotly
    fpath = path.resolve(spaBaseDir, `${plotlyPath}/`, `${ejbOpts.nameCp}Plotly.js`);
    await exports.renderToFileSync(fpath, 'plots/ModelPlotly', ejbOpts, status, verbose);


    if(status.errorOnRender) {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.red('done'));
    } else {
      //msg
      console.log(colors.white('@@ Generating code for model: '), colors.blue(ejbOpts.name), '... ', colors.green('done'));
    }
  }//end: for each model in opts
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
  //console.log("modelsOpts.models: ", modelsOpts.models);
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

    fpath = path.resolve(spaBaseDir, `src/requests/`, `${m.nameLc}.js`);
    await exports.renderToFileSync(fpath, 'requests/model', m, status, verbose);
  }
  for(let i=0; i<modelsOpts.adminModels.length; i++)
  {
    let m = modelsOpts.adminModels[i];
    m.modelsAtts = modelAtts;

    /**
     * Debug
     */
    //console.log("MODEL_OPTS: ", m);

    fpath = path.resolve(spaBaseDir, `src/requests/`, `${m.nameLc}.js`);
    await exports.renderToFileSync(fpath, 'requests/model', m, status, verbose);
  }

  /**
   * requests - index & searchAttributes
   * 
   * */
  // template 57: requests.index
  fpath = path.resolve(spaBaseDir, `src/requests/`, `requests.index.js`);
  await exports.renderToFileSync(fpath, 'requests/requests.index', modelsOpts, status, verbose);

  // template 58: requests.attributes
  fpath = path.resolve(spaBaseDir, `src/requests/`, `requests.attributes.js`);
  await exports.renderToFileSync(fpath, 'requests/requests.attributes', modelsOpts, status, verbose);

  /**
   * routes
   * 
   * */
  // template 59: routes
  fpath = path.resolve(spaBaseDir, `src/routes/`, `routes.js`);
  await exports.renderToFileSync(fpath, 'routes/routes', modelsOpts, status, verbose);

  // template 60: TablesSwitch
  fpath = path.resolve(spaBaseDir, `src/components/main-panel/table-panel/`, `TablesSwitch.js`);
  await exports.renderToFileSync(fpath, 'routes/TablesSwitch', modelsOpts, status, verbose);

  /**
   * acl_rules
   * 
   * */
  // template 61: acl_rules
  fpath = path.resolve(spaBaseDir, `src/`, `acl_rules.js`);
  await exports.renderToFileSync(fpath, 'acl/acl_rules', modelsOpts, status, verbose);

  return status;
}
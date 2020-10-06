#!/usr/bin/env node
ejs = require('ejs');
inflection = require('inflection');
fs = require('fs-extra');
path = require('path');
jsb = require('js-beautify').js_beautify;
funks = require(path.resolve(__dirname, 'funks.js'));
program = require('commander');
const colors = require('colors/safe');

/*
 * Program options
 */
program
  .description('Code generator for SPA.')
  .option('-f, --jsonFiles <filesFolder>', 'Folder containing one json file for each model.')
  .option('-o, --outputDir <directory>', 'Directory where generated code will be written.')
  .option('-D, --createBaseDirs', 'Try to create base directories if they do not exist.')
  .option('-P, --genPlotlyForAll', 'Generates a Plotly JS React component for all the json model files given as input.'+
    'Plotly components will be part of the SPA being generated.')
  .option('-I, --genImageAttachment', 'Generate image attachment model and components to support image attachment operations.')
  .option('-V, --verbose', 'Show details about the results of running code generation process.');

/**
 * Sub-Command: genPlotly
 */
let genPlotly = false;
let modelsWithPlotly = [];
let standalonePlotlyBaseDir = null;
let spaPlotlyDir = null;
program
  .command('genPlotly <jsonModelFile> [moreJsonModelFiles...]')
  .description('Generates a Plotly JS React component for the json models files given as arguments.'+
    'If neither -f nor -A options are given, then -s option will be taken as default.')
  .option('-A, --spaDir <spaDirectory>', 'Plotly components will be generated as part of the SPA located in the given directory.'+
    'This option will be ignored if -f option is given, and the Plotly components will be part of the SPA being generated.')
  .option('-s, --standalonePlotly [plotlyOutputDir]', 
    'Plotly components will be generated in standalone mode in the given output directory, or in ./ if no output directory is given.'+
    'This option will be ignored if either -f option or -A option are given.')
  .action((jsonModelFile, moreJsonModelFiles, cmdObj) => {
    //flag
    genPlotly = true;
    
    //arg: <jsonModelFile>
    modelsWithPlotly.push(jsonModelFile);
    
    //args: [moreJsonModelFiles...]
    if(moreJsonModelFiles) {
      moreJsonModelFiles.forEach((jFile) => {
        if(!modelsWithPlotly.includes(jFile)) {
          modelsWithPlotly.push(jFile);
        }
      });
    }
    
    //op: spaDir
    if(cmdObj.spaDir) {
      spaPlotlyDir = path.resolve(cmdObj.spaDir);
    } else {
      
      //op: standalonePlotly
      if(cmdObj.standalonePlotly) {
        if(typeof cmdObj.standalonePlotly === 'string') {
          standalonePlotlyBaseDir = path.resolve(cmdObj.standalonePlotly);
        } else {
          //default
          standalonePlotlyBaseDir = path.resolve('./');
        }
      } else {
        //default
        standalonePlotlyBaseDir = path.resolve('./');
      }
    }

  });

/**
 * Parse command line arguments
 */
program.parse(process.argv);

/**
 * Case: No SPA (no input json files for SPA).
 */
if(!program.jsonFiles){
  
  //op: verbose
  let verbose = program.verbose !== undefined ? true : false;

  /**
   * Check: sub-command: genPlotly 
   */
  if(genPlotly) {
    if(spaPlotlyDir) {
      /**
       * Case: Generate Plotly as part of an existent SPA.
       */
      return funks.genPlotlyInExistentSpa({
        spaPlotlyDir,
        modelsWithPlotly,
      }, verbose)
      .then((status) => {
        //print summary
        funks.printSummary(status);

        if(status.totalWrongFiles > 0 || status.totalCodeGenerationErrors > 0){
          //msg
          console.log("@ Code generation: ", colors.red('done'));
          process.exit(1);
        } else {
          //msg
          console.log("@ Code generation: ", colors.green('done'));
        }
      })
      .catch((err) => {
        //err
        console.log(colors.red('!'), err);
        console.log("@ Code generation: ", colors.red('done'));
        process.exit(1);
      });
    } else {
      /**
       * Case: Generate standalone Plotly components.
       */
      return funks.genStandalonePlotly({
        standalonePlotlyBaseDir,
        modelsWithPlotly,
      }, verbose)
      .then((status) => {
        //print summary
        funks.printSummary(status);

        if(status.totalWrongFiles > 0 || status.totalCodeGenerationErrors > 0){
          //msg
          console.log("@ Code generation: ", colors.red('done'));
          process.exit(1);
        } else {
          //msg
          console.log("@ Code generation: ", colors.green('done'));
        }
      })
      .catch((err) => {
        //err
        console.log(colors.red('!'), err);
        console.log("@ Code generation: ", colors.red('done'));
        process.exit(1);
      });
    }
  }//end: sub-command: genPlotly 

  /**
   * No sub-commands neither.
   */
  //msg
  console.log(colors.red('! Error: '), 'You must indicate the json files in order to generate the SPA code, or one of the sub-commands.');
  process.exit(1);
} else {
  /**
   * Case: Generate SPA
   */
  return funks.genSpa(program, { plotlyOptions: {genPlotly, modelsWithPlotly} })
  .then((status) => {
    //print summary
    funks.printSummary(status);

    if(status.totalWrongFiles > 0 || status.totalCodeGenerationErrors > 0){
      //msg
      console.log("@ Code generation: ", colors.red('done'));
      process.exit(1);
    } else {
      //msg
      console.log("@ Code generation: ", colors.green('done'));
    }
  })
  .catch((err) => {
    //err
    console.log(colors.red('!'), err);
    console.log("@ Code generation: ", colors.red('done'));
    process.exit(1);
  });
}

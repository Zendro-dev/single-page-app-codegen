inflection = require('inflection');
list = require('list-dir');
_ = require('lodash');
funks = require(path.resolve(__dirname, 'funks.js'));

exports.getSavedModelsNames = function (newModel, directory) {
    var filesNames = list.sync(directory)

    var models = _.map(_.filter(filesNames, function(name) {
        return _.includes(name, 'Routes.js');
    }), function(filePath) {
        return filePath.toString().replace(/.*\//, "")
    });

    var createdModels = _.map(models, function(model){
        var modelElem = model.replace("Routes.js", "");
        return {
            name:modelElem,
            nameLc: funks.uncapitalizeString(modelElem),
            namePl: inflection.pluralize(modelElem),
            namePlLc: funks.uncapitalizeString(inflection.pluralize(modelElem)),
            nameCp: funks.capitalizeString(modelElem)
        }
    })

    if(newModel!= "" && !_.includes(models, newModel + "Routes.js")){
        createdModels.push({
            name:newModel,
            nameLc: funks.uncapitalizeString(newModel),
            namePl: inflection.pluralize(newModel),
            namePlLc: funks.uncapitalizeString(inflection.pluralize(newModel)),
            nameCp: funks.capitalizeString(newModel)
        })
    }

    return {models: createdModels}
}

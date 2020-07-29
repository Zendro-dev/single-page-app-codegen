// Delete this file, if you do not want or need any validations.
const validatorUtil = require('../utils/validatorUtil')
const Ajv = require('ajv')
const ajv = validatorUtil.addDateTimeAjvKeywords(new Ajv({
    allErrors: true
}))

// Dear user, edit the schema to adjust it to your model
module.exports.validator_patch = function(with_validations) {

    with_validations.prototype.validationControl = {
        validateForCreate: true,
        validateForUpdate: true,
        validateForDelete: false,
        validateAfterRead: false
    }

    with_validations.prototype.validatorSchema = {
        "$async": true,
        "properties": {
            "string_1": {
                "type": ["string", "null"]
            },
            "string_2": {
                "type": ["string", "null"]
            },
            "int_1": {
                "type": ["integer", "null"]
            },
            "int_2": {
                "type": ["integer", "null"]
            },
            "float_1": {
                "type": ["number", "null"]
            },
            "float_2": {
                "type": ["number", "null"]
            },
            "boolean_1": {
                "type": ["boolean", "null"]
            },
            "boolean_2": {
                "type": ["boolean", "null"]
            },
            "date_1": {
                "anyOf": [{
                    "isoDate": true
                }, {
                    "type": "null"
                }]
            },
            "date_2": {
                "anyOf": [{
                    "isoDate": true
                }, {
                    "type": "null"
                }]
            },
            "dateTime_1": {
                "anyOf": [{
                    "isoDateTime": true
                }, {
                    "type": "null"
                }]
            },
            "dateTime_2": {
                "anyOf": [{
                    "isoDateTime": true
                }, {
                    "type": "null"
                }]
            },
            "time_1": {
                "anyOf": [{
                    "isoTime": true
                }, {
                    "type": "null"
                }]
            },
            "time_2": {
                "anyOf": [{
                    "isoTime": true
                }, {
                    "type": "null"
                }]
            }
        }
    }

    with_validations.prototype.asyncValidate = ajv.compile(
        with_validations.prototype.validatorSchema
    )

    with_validations.prototype.validateForCreate = async function(record) {
        return await with_validations.prototype.asyncValidate(record)
    }

    with_validations.prototype.validateForUpdate = async function(record) {
        return await with_validations.prototype.asyncValidate(record)
    }

    with_validations.prototype.validateForDelete = async function(id) {

        //TODO: on the input you have the id of the record to be deleted, no generic
        // validation checks are available. You might need to import the correspondant model
        // in order to read the whole record info and the do the validation.

        return {
            error: null
        }
    }

    with_validations.prototype.validateAfterRead = async function(record) {
        return await with_validations.prototype.asyncValidate(record)
    }

    return with_validations
}
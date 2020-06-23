# Single Page App generator

Code generator for ReactJS SPA that implements basic CRUD operations on a GraphQL API.

## Usage

From the command line prompt:

````
$ node index.js -h
Usage: index [options] [command]

Code generator for SPA.

Options:
  -f, --jsonFiles <filesFolder>                                Folder containing one json file for each model.
  -o, --outputDir <directory>                                  Directory where generated code will be written.
  -D, --createBaseDirs                                         Try to create base directories if they do not exist.
  -P, --genPlotlyForAll                                        Generates a Plotly JS React component for all the json model files given as input.Plotly components will be part of the SPA being generated.
  -V, --verbose                                                Show details about the results of running code generation process.
  -h, --help                                                   output usage information

Commands:
  genPlotly [options] <jsonModelFile> [moreJsonModelFiles...]  Generates a Plotly JS React component for the json models files given as arguments.If neither -f nor -A options are given, then -s option will be taken as default.
````

And also:

````
$ node index.js genPlotly -h
Usage: genPlotly [options] <jsonModelFile> [moreJsonModelFiles...]

Generates a Plotly JS React component for the json models files given as arguments.If neither -f nor -A options are given, then -s option will be taken as default.

Options:
  -A, --spaDir <spaDirectory>               Plotly components will be generated as part of the SPA located in the given directory.This option will be ignored if -f option is given, and the Plotly components will be part of the SPA being generated.
  -s, --standalonePlotly [plotlyOutputDir]  Plotly components will be generated in standalone mode in the given output directory, or in ./ if no output directory is given.This option will be ignored if either -f option or -A option are given.
  -h, --help                                output usage information
````

`<directory>` should contain a skeleton of the GUI, for download the skeleton and more details in how to run the GUI see [THIS](https://github.com/ScienceDb/single-page-app).

Note: Currently, integration tests are under development.

## JSON files Spec

Each json file describes one and only one model. (i.e if an association involves two models, this association needs to be specified in both json files, corresponding to each model).

For each model we need to specify the following fields in the json file:

Name | Type | Description
------- | ------- | --------------
*model* | String | Name of the model (it is recommended uppercase for the initial character).
*storageType* | String | Type of storage where the model is stored. So far can be one of: __sql__, __distributed-data-model__, __cenz-server__, __generic__, __sql-adapter__, __ddm-adapter__, __cenzontle-webservice-adapter__, __generic-adapter__.
*attributes* | Object | The key of each entry is the name of the attribute and theres two options for the value . Either can be a string indicating the type of the attribute or an object where the user can indicates the type of the attribute(in the _type_ field) but also can indicates an attribute's description (in the _description_ field). See the [table](#types-spec) below for allowed types. Example of option one: ```{ "attribute1" : "String", "attribute2: "Int" }``` Example of option two: ``` { "attribute1" : {"type" :"String", "description": "Some description"}, "attribute2: "Int ```
*associations* | Object | The key of each entry is the name of the association and the value should be an object describing the associations. See [Associations Spec](associations-spec) section below for the specifications of the associations.

EXAMPLES OF VALID JSON FILES

```
//Dog.json
{
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },

  "associations" : {
    "person" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "personId",
      "keyIn": "Dog"
      "targetStorageType" : "sql"
    }
  }
}

```

```
//Publisher.json
{
  "model" : "Publisher",
  "storageType" : "generic",
  "attributes" : {
    "name" : "String",
    "phone" : "String"
  },
  "associations":{
      "books" : {
          "type" : "to_many",
          "target" : "Book",
          "targetKey" : "publisherId",
          "keyIn": "Book",
          "targetStorageType" : "sql"
        }
  }
}
```

### Types Spec
The following types are allowed for the attributes field

 Type |
------- |
String |
Int |
Float |
Boolean |
Date |
Time |
DateTime |

For more info about `Date`, `Time`, and `DateTime` types, please see this [info](https://github.com/excitement-engineer/graphql-iso-date/blob/HEAD/rfc3339.txt).

Example:
* Date: A date string, such as `2007-12-03`.
* Time: A time string at UTC, such as `10:15:30Z`.
* DateTime: A date-time string at UTC, such as `2007-12-03T10:15:30Z`

### Associations Spec

We will consider two types of associations accordingly to the number of records
that can posibly be associated:
1. to_one
2. to_many

For both type of association, the necessary arguments would be:

name | Type | Description
------- | ------- | --------------
*type* | String | Type of association. So far can be one of: __to_one__, __to_many__, __to_many_through_sql_cross_table__, __generic_to_one__, __generic_to_many__.
*target* | String | Name of model to which the current model will be associated with.
*targetKey* | String | A unique identifier of the association for the case where there appear more than one association with the same model.
*keyIn* | String | Name of the model where the targetKey is stored.
*targetStorageType* | String | Type of storage where the target model is stored. So far can be one of: __sql__, __distributed-data-model__, __cenz-server__, __generic__, __sql-adapter__, __ddm-adapter__, __cenzontle-webservice-adapter__, __generic-adapter__.
*label* | String | Name of the column in the target model to be used as a display name in the GUI.
*sublabel* | String | Optional name of the column in the target model to be used as a sub-label in the GUI.

When the association is of type *to_many* and it referes to a more particular type of association *many_to_many*  it's necessary to describe two extra arguments given that the association is made with a cross table. These arguments are:

name | Type | Description
------- | ------- | --------------
*sourceKey* | String | Key to identify the source id
*keysIn* | String | Name of the cross table

## NOTE:
Be aware that in the case of this type of association the user is required to describe the cross table used in the field _keysIn_ as a model in its own. For example, if we have a model `User` and a model `Role` and they are associated in a _manytomany_ way, then we also need to describe the `role_to_user` model:

```
//User model
{
  "model" : "User",
  "storageType" : "SQL",
  "attributes" : {
    "email" : "String",
    "password" : "String"
  },
  "associations" :{
    "roles" : {
      "type" : "to_many_through_sql_cross_table",
      "target" : "Role",
      "targetKey" : "role_Id",
      "sourceKey" : "user_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "name"
    }
  }

}
```

```
//Role model
{
  "model" : "Role",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "description" : "String"
  },
  "associations" : {
    "users" : {
      "type" : "to_many_through_sql_cross_table",
      "target" : "User",
      "targetKey" : "user_Id",
      "sourceKey" : "role_Id",
      "keysIn" : "role_to_user",
      "targetStorageType" : "sql",
      "label": "email"
    }
  }
}
```

```
//role_to_user model
{
  "model" : "role_to_user",
  "storageType" : "SQL",
  "attributes" : {
    "user_Id" : "Int",
    "role_Id" : "Int"
  }
}

```

## NOTE:
It's important to notice that when a model involves a foreign key for the association, this key should be explicitly written into the attributes field of the given local model.

Example:
```
{
  "model" : "book",
  "storageType" : "sql",
  "attributes" : {
    "title" : {"type":"String", "description": "The book's title"},
    "publisher_id": "Int"
  },
  "associations":{
      "publisher" : {
        "type" : "to_one", //association type
        "target" : "publisher", // Model's name is `publisher`
        "targetKey" : "publisher_id", // Local alias for this association
        "keyIn": "book", // FK to publisher will be stored in the Book model
        "targetStorageType" : generic", //  It's a remote database
        "label" : "name" // Show in GUI the name of the publisher taken from external DB
        }
  }
}
```

## NOTE:
THE SAME DATA MODELS DESCRIPTION(.json files) WILL BE USEFUL FOR GENERATING BOTH, THE [BACKEND](https://github.com/ScienceDb/graphql-server-model-codegen) AND THE FRONTEND OR GUI HERE DESCRIBED.

Fields *`label`* and *`sublabel`* in the specification are only needed by the GUI generator, but backend generator will only read required information, therefore extra fields such as *`label`* and *`sublabel`* will be ignored by the backend generator.

EXAMPLES OF VALID JSON FILE:
```
//dog.json
{
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String",
    "personId": "Int"
  },

  "associations" : {
    "person" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "personId",
      "keyIn": "Dog",
      "targetStorageType" : "sql",
      "label": "firstName"
    }
  }
}

```

```
//book.json
{
 "model" : "Book",
 "storageType" : "SQL",
 "attributes" : {
        "id" : Int,
        "title": String,
        "ISBN": Int
    },
 "associations" : {
        "authors" : {
            "type" : "to_many",
            "target" : "Person",
            "targetKey" : "person_id",
            "sourceKey" : "book_id",
            "keysIn" : "person_to_book",
            "targetStorageType" : "sql",
            "label": "name",
            "sublabel": "lastname"
        }
    }
}
```

module.exports.book = {
  "model" : "Book",
  "storageType" : "sql",
  "attributes" : {
    "title" : "String",
    "genre" : "String"
  },
  "associations":{

      "people" : {
          "type" : "to_many",
          "target" : "Person",
          "targetKey" : "personId",
          "sourceKey" : "bookId",
          "keysIn" : "books_to_people",
          "targetStorageType" : "sql",
          "label" : "firstName",
          "sublabel" : "email"
        },
      "publisher" : {
        "type" : "to_one",
        "target" : "Publisher",
        "targetKey" : "publisherId",
        "targetStorageType" : "webservice",
        "label" : "name"
        }
  }
}
module.exports.dog = {
  "model" : "Dog",
  "storageType" : "Sql",
  "attributes" : {
    "name" : "String",
    "breed" : "String"
  },

  "associations" : {
    "person" : {
      "type" : "to_one",
      "target" : "Person",
      "targetKey" : "personId",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    },
    "researcher":{
      "type" : "to_one",
      "target": "Researcher",
      "targetKey": "researcherId",
      "targetStorageType": "SQL",
      "label": "firstName"
    }
  }
}

module.exports.project = {
  "model" : "Project",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "description" : "String"
  },
  "associations":{
    "specie":{
      "type" : "to_one",
      "target" : "Specie",
      "targetKey" : "specieId",
      "targetStorageType" : "webservice",
      "label" : "nombre",
      "sublabel" : "nombre_cientifico"
    },

    "researchers" : {
      "type" : "to_many",
      "target" : "Researcher",
      "targetKey" : "researcherId",
      "sourceKey" : "projectId",
      "keysIn" : "project_to_researcher",
      "targetStorageType" : "sql",
      "label" : "firstName",
      "sublabel" : "lastName"
    }
  }
}

module.exports.person = {
  "model" : "Person",
  "storageType" : "SQL",
  "attributes" : {
    "firstName" : "String",
    "lastName" : "String",
    "email" : "String"
  },
  "associations":{
    "dogs":{
      "type" : "to_many",
      "target" : "Dog",
      "targetKey" : "personId",
      "targetStorageType" : "sql",
      "label": "name"
    },

    "books":{
      "type" : "to_many",
      "target" : "Book",
      "targetKey" : "bookId",
      "sourceKey" : "personId",
      "keysIn" : "books_to_people",
      "targetStorageType" : "sql",
      "label" : "title"
    }
  }
}

module.exports.individual = {
  "model" : "individual",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String"
  },
  "associations": {
    "transcript_counts": {
      "type" : "to_many",
      "target" : "transcript_count",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "gene",
      "sublabel" : "variable"
    }
  }
}

module.exports.transcript_count = {

  "model" : "transcript_count",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  },
  "associations":{
    "individual":{
      "type" : "to_one",
      "target" : "individual",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}

module.exports.transcriptCount = {

  "model" : "transcriptCount",
  "storageType" : "SQL",
  "attributes" : {
    "gene" : "String",
    "variable" : "String",
    "count" : "Float",
    "tissue_or_condition": "String"
  },
  "associations":{
    "individual":{
      "type" : "to_one",
      "target" : "individual",
      "targetKey" : "individual_id",
      "targetStorageType" : "sql",
      "label" : "name"
    }
  }
}


module.exports.academicTeam = {
  "model" : "academicTeam",
  "storageType" : "SQL",
  "attributes" : {
    "name" : "String",
    "department" : "String",
    "subject": "String"
  },
  "associations":{
    "members":{
      "type" : "to_many",
      "target" : "Researcher",
      "targetKey" : "academicTeamId",
      "targetStorageType" : "sql",
      "label": "firstName",
      "sublabel": "lastName"
    }
  }

}

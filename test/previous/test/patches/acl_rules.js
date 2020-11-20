module.exports = {
  aclRules: [
    //administrator
    {
      roles: 'administrator',
      allows: [{
        resources: [
          'role',
          'role_to_user',
          'user',
        ],
        permissions: '*'
      }]
    },

    //models
    /**
     * Model: accession
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'accession',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'accession',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'accession',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'accession',
        permissions: 'delete'
      }]
    },
    /**
     * Model: acl_validations
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'acl_validations',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'acl_validations',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'acl_validations',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'acl_validations',
        permissions: 'delete'
      }]
    },
    /**
     * Model: aminoacidsequence
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'aminoacidsequence',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'aminoacidsequence',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'aminoacidsequence',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'aminoacidsequence',
        permissions: 'delete'
      }]
    },
    /**
     * Model: capital
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'capital',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'capital',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'capital',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'capital',
        permissions: 'delete'
      }]
    },
    /**
     * Model: country
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'country',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'country',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'country',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'country',
        permissions: 'delete'
      }]
    },
    /**
     * Model: country_to_river
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'country_to_river',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'country_to_river',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'country_to_river',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'country_to_river',
        permissions: 'delete'
      }]
    },
    /**
     * Model: cultivar
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'cultivar',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'cultivar',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'cultivar',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'cultivar',
        permissions: 'delete'
      }]
    },
    /**
     * Model: dog
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'dog',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'dog',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'dog',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'dog',
        permissions: 'delete'
      }]
    },
    /**
     * Model: field_plot
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'field_plot',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'field_plot',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'field_plot',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'field_plot',
        permissions: 'delete'
      }]
    },
    /**
     * Model: individual
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'individual',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'individual',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'individual',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'individual',
        permissions: 'delete'
      }]
    },
    /**
     * Model: location
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'location',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'location',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'location',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'location',
        permissions: 'delete'
      }]
    },
    /**
     * Model: measurement
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'measurement',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'measurement',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'measurement',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'measurement',
        permissions: 'delete'
      }]
    },
    /**
     * Model: microbiome_asv
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'microbiome_asv',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'microbiome_asv',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'microbiome_asv',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'microbiome_asv',
        permissions: 'delete'
      }]
    },
    /**
     * Model: parrot
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'parrot',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'parrot',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'parrot',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'parrot',
        permissions: 'delete'
      }]
    },
    /**
     * Model: person
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'person',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'person',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'person',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'person',
        permissions: 'delete'
      }]
    },
    /**
     * Model: plant_measurement
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'plant_measurement',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'plant_measurement',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'plant_measurement',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'plant_measurement',
        permissions: 'delete'
      }]
    },
    /**
     * Model: pot
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'pot',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'pot',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'pot',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'pot',
        permissions: 'delete'
      }]
    },
    /**
     * Model: river
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'river',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'river',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'river',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'river',
        permissions: 'delete'
      }]
    },
    /**
     * Model: sample
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'sample',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'sample',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sample',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sample',
        permissions: 'delete'
      }]
    },
    /**
     * Model: sample_measurement
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'sample_measurement',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'sample_measurement',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sample_measurement',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sample_measurement',
        permissions: 'delete'
      }]
    },
    /**
     * Model: sequencingExperiment
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'sequencingExperiment',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'sequencingExperiment',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sequencingExperiment',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'sequencingExperiment',
        permissions: 'delete'
      }]
    },
    /**
     * Model: taxon
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'taxon',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'taxon',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'taxon',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'taxon',
        permissions: 'delete'
      }]
    },
    /**
     * Model: transcript_count
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'transcript_count',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'transcript_count',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'transcript_count',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'transcript_count',
        permissions: 'delete'
      }]
    },
    /**
     * Model: with_validations
     */
    {
      roles: 'editor',
      allows: [{
        resources: 'with_validations',
        permissions: 'create'
      }]
    },
    {
      roles: 'reader',
      allows: [{
        resources: 'with_validations',
        permissions: 'read'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'with_validations',
        permissions: 'update'
      }]
    },
    {
      roles: 'editor',
      allows: [{
        resources: 'with_validations',
        permissions: 'delete'
      }]
    },
  ]
}
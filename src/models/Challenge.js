/**
 * This defines Challenge model.
 */

const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const schema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  legacyId: {
    type: Number,
    required: false
  },
  typeId: {
    type: String,
    required: true
  },
  legacy: {
    type: Object,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  privateDescription: {
    type: String,
    required: false
  },
  metadata: {
    type: [Object],
    required: false
  },
  timelineTemplateId: {
    type: String,
    required: true
  },
  phases: {
    type: Array,
    required: true
  },
  terms: {
    type: Array,
    required: false
  },
  prizeSets: {
    type: [Object],
    required: true
  },
  // tag names
  tags: {
    type: Array,
    required: true
  },
  projectId: {
    type: Number,
    required: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  attachments: {
    type: Array,
    required: false
  },
  // group names
  groups: {
    type: Array,
    required: false
  },
  gitRepoURLs: {
    type: Array,
    required: false
  },
  // winners
  winners: {
    type: Array,
    required: false
  },
  created: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updated: {
    type: Date,
    required: false
  },
  updatedBy: {
    type: String,
    required: false
  }
},
{
  throughput: 'ON_DEMAND',
  useDocumentTypes: true
}
)

module.exports = schema

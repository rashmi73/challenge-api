/*
 * Unit tests of challenge service
 */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

require('../../app-bootstrap')
const _ = require('lodash')
const uuid = require('uuid/v4')
const chai = require('chai')
const fs = require('fs')
const path = require('path')
const service = require('../../src/services/ChallengeService')
const AttachmentService = require('../../src/services/AttachmentService')
const testHelper = require('../testHelper')

const should = chai.should()

const attachmentContent = fs.readFileSync(path.join(__dirname, '../attachment.txt'))

describe('challenge service unit tests', () => {
  // created entity id
  let id
  let attachment
  // generated data
  let data
  const notFoundId = uuid()

  before(async () => {
    await testHelper.createData()
    data = testHelper.getData()
    // create an attachment for test
    attachment = await AttachmentService.uploadAttachment({
      isMachine: true
    }, data.challenge.id, {
      attachment: {
        data: attachmentContent,
        mimetype: 'plain/text',
        name: 'attachment.txt',
        size: attachmentContent.length
      }
    })
  })

  after(async () => {
    await testHelper.clearData()
  })

  describe('create challenge tests', () => {
    it('create challenge successfully', async () => {
      const result = await service.createChallenge({ isMachine: true, sub: 'sub' },
        _.omit(data.challenge, ['id', 'created', 'createdBy']))
      should.exist(result.id)
      id = result.id
      should.equal(result.typeId, data.challenge.typeId)
      should.equal(result.track, data.challenge.track)
      should.equal(result.name, data.challenge.name)
      should.equal(result.description, data.challenge.description)
      should.equal(result.challengeSettings.length, 1)
      should.equal(result.challengeSettings[0].type, data.challenge.challengeSettings[0].type)
      should.equal(result.challengeSettings[0].value, data.challenge.challengeSettings[0].value)
      should.equal(result.timelineTemplateId, data.challenge.timelineTemplateId)
      should.equal(result.phases.length, 1)
      should.equal(result.phases[0].id, data.challenge.phases[0].id)
      should.equal(result.phases[0].name, data.challenge.phases[0].name)
      should.equal(result.phases[0].description, data.challenge.phases[0].description)
      should.equal(result.phases[0].isActive, data.challenge.phases[0].isActive)
      should.equal(result.phases[0].duration, data.challenge.phases[0].duration)
      should.equal(result.prizeSets.length, 1)
      should.equal(result.prizeSets[0].type, data.challenge.prizeSets[0].type)
      should.equal(result.prizeSets[0].description, data.challenge.prizeSets[0].description)
      should.equal(result.prizeSets[0].prizes.length, 1)
      should.equal(result.prizeSets[0].prizes[0].description, data.challenge.prizeSets[0].prizes[0].description)
      should.equal(result.prizeSets[0].prizes[0].type, data.challenge.prizeSets[0].prizes[0].type)
      should.equal(result.prizeSets[0].prizes[0].value, data.challenge.prizeSets[0].prizes[0].value)
      should.equal(result.reviewType, data.challenge.reviewType)
      should.equal(result.tags.length, 1)
      should.equal(result.tags[0], data.challenge.tags[0])
      should.equal(result.projectId, data.challenge.projectId)
      should.equal(result.legacyId, data.challenge.legacyId)
      should.equal(result.forumId, data.challenge.forumId)
      should.equal(result.status, data.challenge.status)
      should.equal(result.groups.length, 1)
      should.equal(result.groups[0], data.challenge.groups[0])
      should.equal(result.createdBy, 'sub')
      should.exist(result.startDate)
      should.exist(result.created)
    })

    it('create challenge - type not found', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.typeId = notFoundId
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message, `No challenge type found with id: ${notFoundId}.`)
        return
      }
      throw new Error('should not reach here')
    })

    it('create challenge - invalid projectId', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.projectId = -1
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"projectId" must be a positive number') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('create challenge - missing name', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'name', 'created', 'createdBy'])
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"name" is required') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('create challenge - invalid date', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.startDate = 'abc'
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"startDate" must be a number of milliseconds or valid date string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('create challenge - invalid status', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.status = ['Active']
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"status" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('create challenge - unexpected field', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.other = 123
        await service.createChallenge({ isMachine: true, sub: 'sub' }, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"other" is not allowed') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })
  })

  describe('get challenge tests', () => {
    it('get challenge successfully', async () => {
      const result = await service.getChallenge({ isMachine: true }, data.challenge.id)
      should.equal(result.id, data.challenge.id)
      should.equal(result.typeId, data.challenge.typeId)
      should.equal(result.track, data.challenge.track)
      should.equal(result.name, data.challenge.name)
      should.equal(result.description, data.challenge.description)
      should.equal(result.challengeSettings.length, 1)
      should.equal(result.challengeSettings[0].type, data.challengeSetting.name)
      should.equal(result.challengeSettings[0].value, data.challenge.challengeSettings[0].value)
      should.equal(result.timelineTemplateId, data.challenge.timelineTemplateId)
      should.equal(result.phases.length, 1)
      should.equal(result.phases[0].id, data.challenge.phases[0].id)
      should.equal(result.phases[0].name, data.challenge.phases[0].name)
      should.equal(result.phases[0].description, data.challenge.phases[0].description)
      should.equal(result.phases[0].isActive, data.challenge.phases[0].isActive)
      should.equal(result.phases[0].duration, data.challenge.phases[0].duration)
      should.equal(result.prizeSets.length, 1)
      should.equal(result.prizeSets[0].type, data.challenge.prizeSets[0].type)
      should.equal(result.prizeSets[0].description, data.challenge.prizeSets[0].description)
      should.equal(result.prizeSets[0].prizes.length, 1)
      should.equal(result.prizeSets[0].prizes[0].description, data.challenge.prizeSets[0].prizes[0].description)
      should.equal(result.prizeSets[0].prizes[0].type, data.challenge.prizeSets[0].prizes[0].type)
      should.equal(result.prizeSets[0].prizes[0].value, data.challenge.prizeSets[0].prizes[0].value)
      should.equal(result.reviewType, data.challenge.reviewType)
      should.equal(result.tags.length, 1)
      should.equal(result.tags[0], data.challenge.tags[0])
      should.equal(result.projectId, data.challenge.projectId)
      should.equal(result.legacyId, data.challenge.legacyId)
      should.equal(result.forumId, data.challenge.forumId)
      should.equal(result.status, data.challenge.status)
      should.equal(result.groups.length, 1)
      should.equal(result.groups[0], data.challenge.groups[0])
      should.equal(result.createdBy, 'admin')
      should.exist(result.startDate)
      should.exist(result.created)
    })

    it('get challenge - not found', async () => {
      try {
        await service.getChallenge({ isMachine: true }, notFoundId)
      } catch (e) {
        should.equal(e.message, `Challenge of id ${notFoundId} is not found.`)
        return
      }
      throw new Error('should not reach here')
    })

    it('get challenge - invalid id', async () => {
      try {
        await service.getChallenge({ isMachine: true }, 'invalid')
      } catch (e) {
        should.equal(e.message.indexOf('"id" must be a valid GUID') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })
  })

  describe('search challenges tests', () => {
    it('search challenges successfully 1', async () => {
      const res = await service.searchChallenges({ isMachine: true }, {
        page: 1,
        perPage: 10,
        id: data.challenge.id,
        typeId: data.challenge.typeId,
        track: data.challenge.track,
        name: data.challenge.name.substring(2).trim().toUpperCase(),
        description: data.challenge.description,
        timelineTemplateId: data.challenge.timelineTemplateId,
        reviewType: data.challenge.reviewType,
        tag: data.challenge.tags[0],
        projectId: data.challenge.projectId,
        forumId: data.challenge.forumId,
        legacyId: data.challenge.legacyId,
        status: data.challenge.status,
        group: data.challenge.groups[0],
        createdDateStart: '1992-01-02',
        createdDateEnd: '2022-01-02',
        createdBy: data.challenge.createdBy
      })
      should.equal(res.total, 1)
      should.equal(res.page, 1)
      should.equal(res.perPage, 10)
      should.equal(res.result.length, 1)
      const result = res.result[0]
      should.equal(result.id, data.challenge.id)
      should.equal(result.type, data.challengeType.name)
      should.equal(result.track, data.challenge.track)
      should.equal(result.name, data.challenge.name)
      should.equal(result.description, data.challenge.description)
      should.equal(result.challengeSettings.length, 1)
      should.equal(result.challengeSettings[0].type, data.challengeSetting.name)
      should.equal(result.challengeSettings[0].value, data.challenge.challengeSettings[0].value)
      should.equal(result.timelineTemplateId, data.challenge.timelineTemplateId)
      should.equal(result.phases.length, 1)
      should.equal(result.phases[0].id, data.challenge.phases[0].id)
      should.equal(result.phases[0].name, data.challenge.phases[0].name)
      should.equal(result.phases[0].description, data.challenge.phases[0].description)
      should.equal(result.phases[0].isActive, data.challenge.phases[0].isActive)
      should.equal(result.phases[0].duration, data.challenge.phases[0].duration)
      should.equal(result.prizeSets.length, 1)
      should.equal(result.prizeSets[0].type, data.challenge.prizeSets[0].type)
      should.equal(result.prizeSets[0].description, data.challenge.prizeSets[0].description)
      should.equal(result.prizeSets[0].prizes.length, 1)
      should.equal(result.prizeSets[0].prizes[0].description, data.challenge.prizeSets[0].prizes[0].description)
      should.equal(result.prizeSets[0].prizes[0].type, data.challenge.prizeSets[0].prizes[0].type)
      should.equal(result.prizeSets[0].prizes[0].value, data.challenge.prizeSets[0].prizes[0].value)
      should.equal(result.reviewType, data.challenge.reviewType)
      should.equal(result.tags.length, 1)
      should.equal(result.tags[0], data.challenge.tags[0])
      should.equal(result.projectId, data.challenge.projectId)
      should.equal(result.legacyId, data.challenge.legacyId)
      should.equal(result.forumId, data.challenge.forumId)
      should.equal(result.status, data.challenge.status)
      should.equal(result.groups.length, 1)
      should.equal(result.groups[0], data.challenge.groups[0])
      should.equal(result.createdBy, 'admin')
      should.exist(result.startDate)
      should.exist(result.created)
    })

    it('search challenges successfully 2', async () => {
      const result = await service.searchChallenges({ isMachine: true }, { name: 'aaa bbb ccc' })
      should.equal(result.total, 0)
      should.equal(result.page, 1)
      should.equal(result.perPage, 20)
      should.equal(result.result.length, 0)
    })

    it('search challenges - invalid name', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { name: ['invalid'] })
      } catch (e) {
        should.equal(e.message.indexOf('"name" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid forumId', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { forumId: -1 })
      } catch (e) {
        should.equal(e.message.indexOf('"forumId" must be a positive number') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid page', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { page: -1 })
      } catch (e) {
        should.equal(e.message.indexOf('"page" must be larger than or equal to 1') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid perPage', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { perPage: -1 })
      } catch (e) {
        should.equal(e.message.indexOf('"perPage" must be larger than or equal to 1') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid name', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { name: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"name" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid track', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { track: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"track" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid description', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { description: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"description" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid reviewType', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { reviewType: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"reviewType" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid tag', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { tag: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"tag" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid group', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { group: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"group" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid createdBy', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { createdBy: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"createdBy" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - invalid updatedBy', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { updatedBy: ['abc'] })
      } catch (e) {
        should.equal(e.message.indexOf('"updatedBy" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('search challenges - unexpected field', async () => {
      try {
        await service.searchChallenges({ isMachine: true }, { other: 123 })
      } catch (e) {
        should.equal(e.message.indexOf('"other" is not allowed') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })
  })

  describe('fully update challenge tests', () => {
    it('fully update challenge successfully', async () => {
      const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
      challengeData.track = 'updated-track'
      challengeData.projectId = 112233
      challengeData.legacyId = 445566
      challengeData.attachmentIds = [attachment.id]
      const result = await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, id, challengeData)
      should.equal(result.id, id)
      should.equal(result.typeId, data.challenge.typeId)
      should.equal(result.track, 'updated-track')
      should.equal(result.name, data.challenge.name)
      should.equal(result.description, data.challenge.description)
      should.equal(result.challengeSettings.length, 1)
      should.equal(result.challengeSettings[0].type, data.challenge.challengeSettings[0].type)
      should.equal(result.challengeSettings[0].value, data.challenge.challengeSettings[0].value)
      should.equal(result.timelineTemplateId, data.challenge.timelineTemplateId)
      should.equal(result.phases.length, 1)
      should.equal(result.phases[0].id, data.challenge.phases[0].id)
      should.equal(result.phases[0].name, data.challenge.phases[0].name)
      should.equal(result.phases[0].description, data.challenge.phases[0].description)
      should.equal(result.phases[0].isActive, data.challenge.phases[0].isActive)
      should.equal(result.phases[0].duration, data.challenge.phases[0].duration)
      should.equal(result.prizeSets.length, 1)
      should.equal(result.prizeSets[0].type, data.challenge.prizeSets[0].type)
      should.equal(result.prizeSets[0].description, data.challenge.prizeSets[0].description)
      should.equal(result.prizeSets[0].prizes.length, 1)
      should.equal(result.prizeSets[0].prizes[0].description, data.challenge.prizeSets[0].prizes[0].description)
      should.equal(result.prizeSets[0].prizes[0].type, data.challenge.prizeSets[0].prizes[0].type)
      should.equal(result.prizeSets[0].prizes[0].value, data.challenge.prizeSets[0].prizes[0].value)
      should.equal(result.reviewType, data.challenge.reviewType)
      should.equal(result.tags.length, 1)
      should.equal(result.tags[0], data.challenge.tags[0])
      should.equal(result.projectId, 112233)
      should.equal(result.legacyId, 445566)
      should.equal(result.forumId, data.challenge.forumId)
      should.equal(result.status, data.challenge.status)
      should.equal(result.groups.length, 1)
      should.equal(result.groups[0], data.challenge.groups[0])
      should.equal(result.attachments.length, 1)
      should.equal(result.attachments[0].id, attachment.id)
      should.equal(result.attachments[0].fileSize, attachment.fileSize)
      should.equal(result.attachments[0].fileName, attachment.fileName)
      should.equal(result.attachments[0].challengeId, attachment.challengeId)
      should.equal(result.createdBy, 'sub')
      should.equal(result.updatedBy, 'sub2')
      should.exist(result.startDate)
      should.exist(result.created)
      should.exist(result.updated)
    })

    it('fully update challenge - not found', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.track = 'updated-track'
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, notFoundId, challengeData)
      } catch (e) {
        should.equal(e.message, `Challenge with id: ${notFoundId} doesn't exist`)
        return
      }
      throw new Error('should not reach here')
    })

    it('fully update challenge - invalid id', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.track = 'updated-track'
        challengeData.attachmentIds = [attachment.id]
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, 'invalid', challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"challengeId" must be a valid GUID') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('fully update challenge - null name', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.name = null
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, id, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"name" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('fully update challenge - invalid name', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.name = ['abc']
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, id, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"name" must be a string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('fully update challenge - empty track', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.track = ''
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, id, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"track" is not allowed to be empty') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('fully update challenge - invalid status', async () => {
      try {
        const challengeData = _.omit(data.challenge, ['id', 'created', 'createdBy'])
        challengeData.status = 'invalid'
        await service.fullyUpdateChallenge({ isMachine: true, sub: 'sub2' }, id, challengeData)
      } catch (e) {
        should.equal(e.message.indexOf('"status" must be one of [Draft, Canceled, Active, Completed]') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })
  })

  describe('partially update challenge tests', () => {
    it('partially update challenge successfully 1', async () => {
      const result = await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
        track: 'track 333',
        description: 'updated desc',
        attachmentIds: [] // this will delete attachments
      })
      should.equal(result.id, id)
      should.equal(result.typeId, data.challenge.typeId)
      should.equal(result.track, 'track 333')
      should.equal(result.name, data.challenge.name)
      should.equal(result.description, 'updated desc')
      should.equal(result.challengeSettings.length, 1)
      should.equal(result.challengeSettings[0].type, data.challenge.challengeSettings[0].type)
      should.equal(result.challengeSettings[0].value, data.challenge.challengeSettings[0].value)
      should.equal(result.timelineTemplateId, data.challenge.timelineTemplateId)
      should.equal(result.phases.length, 1)
      should.equal(result.phases[0].id, data.challenge.phases[0].id)
      should.equal(result.phases[0].name, data.challenge.phases[0].name)
      should.equal(result.phases[0].description, data.challenge.phases[0].description)
      should.equal(result.phases[0].isActive, data.challenge.phases[0].isActive)
      should.equal(result.phases[0].duration, data.challenge.phases[0].duration)
      should.equal(result.prizeSets.length, 1)
      should.equal(result.prizeSets[0].type, data.challenge.prizeSets[0].type)
      should.equal(result.prizeSets[0].description, data.challenge.prizeSets[0].description)
      should.equal(result.prizeSets[0].prizes.length, 1)
      should.equal(result.prizeSets[0].prizes[0].description, data.challenge.prizeSets[0].prizes[0].description)
      should.equal(result.prizeSets[0].prizes[0].type, data.challenge.prizeSets[0].prizes[0].type)
      should.equal(result.prizeSets[0].prizes[0].value, data.challenge.prizeSets[0].prizes[0].value)
      should.equal(result.reviewType, data.challenge.reviewType)
      should.equal(result.tags.length, 1)
      should.equal(result.tags[0], data.challenge.tags[0])
      should.equal(result.projectId, 112233)
      should.equal(result.legacyId, 445566)
      should.equal(result.forumId, data.challenge.forumId)
      should.equal(result.status, data.challenge.status)
      should.equal(result.groups.length, 1)
      should.equal(result.groups[0], data.challenge.groups[0])
      should.equal(!result.attachments || result.attachments.length === 0, true)
      should.equal(result.createdBy, 'sub')
      should.equal(result.updatedBy, 'sub3')
      should.exist(result.startDate)
      should.exist(result.created)
      should.exist(result.updated)
    })

    it('partially update challenge - timeline template not found', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          timelineTemplateId: notFoundId
        })
      } catch (e) {
        should.equal(e.message, `TimelineTemplate with id: ${notFoundId} doesn't exist`)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - challenge not found', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, notFoundId, {
          track: 'track 333'
        })
      } catch (e) {
        should.equal(e.message, `Challenge with id: ${notFoundId} doesn't exist`)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - invalid type id', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          typeId: 'invalid'
        })
      } catch (e) {
        should.equal(e.message.indexOf('"typeId" must be a valid GUID') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - empty tags', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          tags: []
        })
      } catch (e) {
        should.equal(e.message.indexOf('"tags" does not contain 1 required value(s)') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - invalid start date', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          startDate: 'abc'
        })
      } catch (e) {
        should.equal(e.message.indexOf('"startDate" must be a number of milliseconds or valid date string') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - invalid forumId', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          forumId: 'abc'
        })
      } catch (e) {
        should.equal(e.message.indexOf('"forumId" must be a number') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - empty name', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          name: ''
        })
      } catch (e) {
        should.equal(e.message.indexOf('"name" is not allowed to be empty') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })

    it('partially update challenge - unexpected field', async () => {
      try {
        await service.partiallyUpdateChallenge({ isMachine: true, sub: 'sub3' }, id, {
          other: '123'
        })
      } catch (e) {
        should.equal(e.message.indexOf('"other" is not allowed') >= 0, true)
        return
      }
      throw new Error('should not reach here')
    })
  })
})
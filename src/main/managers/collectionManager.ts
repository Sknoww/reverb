import logger from '../logger'

const newman = require('newman')

export const runCollection = async (collectionFilePath: string) => {
  try {
    const collection = await newman.run({
      collection: require(collectionFilePath),
      reporters: ['cli']
    })
    logger.log('Collection run result:', collection)
    return collection
  } catch (error) {
    logger.error('Error running collection:', error)
    return { error: (error as Error).message }
  }
}

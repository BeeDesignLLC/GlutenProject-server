const algoliasearch = require('algoliasearch')

const algolia = algoliasearch(
  process.env['ALGOLIA_APP_ID'],
  process.env['ALGOLIA_API_KEY'],
)
const index = algolia.initIndex(process.env['ALGOLIA_INDEX_NAME'])

const modelName = 'Product'

module.exports = event => {
  if (!process.env['ALGOLIA_APP_ID']) {
    console.log('Please provide a valid Algolia app id!')
    return {error: 'Module not configured correctly.'}
  }

  if (!process.env['ALGOLIA_API_KEY']) {
    console.log('Please provide a valid Algolia api key!')
    return {error: 'Module not configured correctly.'}
  }

  if (!process.env['ALGOLIA_INDEX_NAME']) {
    console.log('Please provide a valid Algolia index name!')
    return {error: 'Module not configured correctly.'}
  }

  const mutation = event.data[modelName].mutation
  const product = event.data[modelName].node
  const previousValues = event.data[modelName].previousValues

  switch (mutation) {
    case 'CREATED':
      return syncAddedNode(product)
    case 'UPDATED':
      return syncUpdatedNode(product)
    case 'DELETED':
      return syncDeletedNode(previousValues)
    default:
      console.log(`mutation was '${mutation}'. Unable to sync node.`)
      return Promise.resolve()
  }
}

const translateGraphCoolToAlgolia = product => ({
  objectID: product.id,
  name: product.name,
  isAffiliate: product.isAffiliate,
  isHidden: product.isHidden,
  brandName: product.brand.name,
  brandBoost: product.brand.boost,
  brandIsHidden: product.brand.isHidden,
  brandId: product.brand.id,
  thrive: product.thriveListings,
})

function syncAddedNode(node) {
  console.log('Adding node')
  return index.addObject(translateGraphCoolToAlgolia(node))
}

function syncUpdatedNode(node) {
  console.log('Updating node')
  return index.saveObject(translateGraphCoolToAlgolia(node))
}

function syncDeletedNode(node) {
  console.log('Deleting node')
  return index.deleteObject(node.objectID)
}

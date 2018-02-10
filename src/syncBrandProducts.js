const algoliasearch = require('algoliasearch')

const algolia = algoliasearch(
  process.env['ALGOLIA_APP_ID'],
  process.env['ALGOLIA_API_KEY'],
)
const index = algolia.initIndex(process.env['ALGOLIA_INDEX_NAME'])

const modelName = 'Brand'

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
  const brand = event.data[modelName].node
  const previousValues = event.data[modelName].previousValues

  switch (mutation) {
    case 'CREATED':
      return syncAddedNode(brand)
    case 'UPDATED':
      return syncUpdatedNode(brand)
    default:
      console.log(`mutation was '${mutation}'. Unable to sync node.`)
      return Promise.resolve()
  }
}

const translateGraphCoolToAlgolia = brand =>
  brand.products.map(product => ({
    objectID: product.id,
    name: product.name,
    isAffiliate: product.isAffiliate,
    isHidden: product.isHidden,
    brandName: brand.name,
    brandBoost: brand.boost,
    brandIsHidden: brand.isHidden,
    brandId: brand.id,
    thrive: product.thriveListings,
  }))

function syncAddedNode(node) {
  console.log('Adding nodes')
  return index.addObjects(translateGraphCoolToAlgolia(node))
}

function syncUpdatedNode(node) {
  console.log('Updating nodes')
  return index.saveObjects(translateGraphCoolToAlgolia(node))
}

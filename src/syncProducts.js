const raven = require('raven')
raven
  .config(process.env.SENTRY_DSN, {
    logger: 'server',
    name: 'syncProducts',
  })
  .install()
const algoliasearch = require('algoliasearch')
const ImgixClient = require('imgix-core-js')

const algolia = algoliasearch(
  process.env['ALGOLIA_APP_ID'],
  process.env['ALGOLIA_API_KEY'],
)
const index = algolia.initIndex(process.env['ALGOLIA_INDEX_NAME'])

const imgix = new ImgixClient({
  host: 'tgp.imgix.net',
  secureURLToken: process.env.IMGIX_TOKEN,
})

const modelName = 'Product'

module.exports = event => {
  try {
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
  } catch (err) {
    raven.captureException(err, {extra: event})
  }
}

const bestPriceFrom = offers => {
  if (!offers.length) return null

  const prices = offers.map(offer => offer.price).sort()

  if (!prices.length) return null

  return prices[0]
}

const translateGraphCoolToAlgolia = product => {
  const offers = product.offers.filter(offer => offer.deleteStatus !== 'delete')
  return {
    objectID: product.id,
    name: product.name,
    slug: product.slug,
    hasOffers: !!offers.length || !!product.brand.whereToBuyUrl,
    isAffiliate: offers.some(offer => offer.isAffiliate),
    isHidden: product.isHidden,
    boost: product.boost,
    keywords: product.keywords,
    gfCert: product.gfCert,
    gfCertLevel: product.gfCertLevel,
    image: imgix.buildURL(product.image, {auto: 'format', w: 300, h: 300}),
    imageDpr2: imgix.buildURL(product.image, {
      auto: 'format',
      w: 300,
      h: 300,
      dpr: 2,
      q: 50,
    }),
    imageDpr3: imgix.buildURL(product.image, {
      auto: 'format',
      w: 300,
      h: 300,
      dpr: 3,
      q: 40,
    }),
    imageDpr4: imgix.buildURL(product.image, {
      auto: 'format',
      w: 300,
      h: 300,
      dpr: 4,
      q: 30,
    }),
    amazonImage: product.amazonImage,
    size: product.size,
    description: product.description,
    ingredients: product.ingredients,
    brandName: product.brand.name,
    brandBoost: product.brand.boost,
    brandIsHidden: product.brand.isHidden,
    brandId: product.brand.id,
    brandWhereToBuyUrl: product.brand.whereToBuyUrl,
    offers,
    bestPrice: bestPriceFrom(offers),
  }
}

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

const raven = require('raven')
raven
  .config(process.env.SENTRY_DSN, {
    logger: 'server',
    name: 'syncOffers',
  })
  .install()
import {fromEvent} from 'graphcool-lib'

const updateMutation = `mutation($id: ID! $forceSyncTrigger: String!) {
  updateProduct(
		id: $id
    forceSyncTrigger: $forceSyncTrigger
	) {
    id
  }
}`
const deleteMutation = `mutation($id: ID!) {
  deleteOffer(id: $id) {
    id
  }
}`

export default async event => {
  try {
    const api = fromEvent(event).api('simple/v1')
    const result = event.data.Offer
    const productId = result.node.product.id

    if (result.node.deleteStatus === 'delete') {
      await api.request(deleteMutation, {id: result.node.id})
    }

    if (
      result.mutation === 'CREATED' ||
      result.node.deleteStatus === 'delete'
    ) {
      await api.request(updateMutation, {
        id: productId,
        forceSyncTrigger: new Date().toISOString(),
      })
      return {event: `Touched ${productId}`}
    }

    return {event: 'nothing to do'}
  } catch (err) {
    raven.captureException(err, {extra: event})
    return {error: err}
  }
}

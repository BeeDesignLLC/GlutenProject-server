import {fromEvent} from 'graphcool-lib'
const PQueue = require('p-queue')
const queue = new PQueue({concurrency: 30})

const mutation = `mutation($id: ID! $forceSyncTrigger: String!) {
  updateProduct(
		id: $id
    forceSyncTrigger: $forceSyncTrigger
	) {
    id
  }
}`

export default async event => {
  try {
    const api = fromEvent(event).api('simple/v1')
    const brand = event.data.Brand.node
    const products = brand.products

    for (let product of products) {
      queue.add(
        async () =>
          await api.request(mutation, {
            id: product.id,
            forceSyncTrigger: new Date().toISOString(),
          }),
      )
    }

    await queue.onEmpty()

    return {event: `Touched ${products.length} products`}
  } catch (err) {
    return {error: err}
  }
}

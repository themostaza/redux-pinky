import uuid from 'uuid'

const handleEventHook = (meta, hook, ...args) => {
  if (meta && meta[hook] && typeof meta[hook] === 'function') {
    // We want to make sure that an "eventHook" doesn't cause a dispatch to fail, so we wrap it
    // with a try..catch. In dev, we `console.error` which will result in a redbox.
    try {
      meta[hook](...args)
    } catch (e) {
      console.error(e)
    }
  }
}

export default (store) => (next) => (action) => {
  // A common use case for redux-thunk is to conditionally dispatch an action.
  // By allowing for null, we satisfy this use case without people having to use redux-thunk.
  if (action === null) {
    return null
  }

  const isPromise = action.promise && typeof action.promise.then === 'function'

  // This is the "vanilla redux" pathway. These are plain old actions that will get sent to reducers
  if (!isPromise) {
    return next(action)
  }

  // This is the convention-based promise middleware.
  // Ideally, all "async actions" would go through this pathway.
  const { promise, type, payload, meta } = action

  // It is sometimes useful to be able to track the actions and associated promise lifecycle with a
  // sort of unique identifier.
  const transactionId = uuid.v4()
  const initialPayload = payload

  // Dispatch the _REQUEST type action
  store.dispatch({
    type: `${type}_REQUEST`,
    payload,
    meta: { ...meta, transactionId }
  })
  handleEventHook(meta, 'onStart', payload, store.getState)

  // Prepare the _SUCCESS type action
  const success = (data) => {
    store.dispatch({
      type: `${type}_SUCCESS`,
      payload: data,
      meta: { ...meta, initialPayload, transactionId }
    })
    handleEventHook(meta, 'onSuccess', data, store.getState)
    handleEventHook(meta, 'onFinish', true, store.getState)
  }

  // Prepare the _FAILURE type action
  const failure = (error) => {
    store.dispatch({
      type: `${type}_FAILURE`,
      payload: error,
      error: true,
      meta: { ...meta, initialPayload, transactionId }
    })
    handleEventHook(meta, 'onFailure', error, store.getState)
    handleEventHook(meta, 'onFinish', false, store.getState)
  }

  // Return the promise.
  // In this case, when users dispatch an action with a promise payload, they can `.then` it.
  return promise.then(success, failure)
}

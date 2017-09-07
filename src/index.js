/* @flow */
import uuid from 'uuid';

export type AsyncParameters = {
  payload?: any,
  promise: Promise<any>,
  meta?: {
    onStart?: (payload: any, getState: () => any) => any,
    onFinish?: (result: boolean, getState: () => any) => any,
    onSuccess?: (payload: any, getState: () => any) => any,
    onFailure?: (error: any, getState: () => any) => any,
  },
};

const handleEventHook = (meta: Object, hook: string, ...args) => {
  if (meta && meta[hook] && typeof meta[hook] === 'function') {
    // We want to make sure that an "eventHook" doesn't cause a dispatch to fail, so we wrap it
    // with a try..catch. In dev, we `console.error` which will result in a redbox.
    try {
      meta[hook](...args);
    } catch (e) {
      console.error(e);
    }
  }
};

export default (store: any) => (next: any) => (action: any) => {
  const isPromise = action.promise && typeof action.promise.then === 'function';

  // This is the "vanilla redux" pathway. These are plain old actions that will get sent to reducers
  if (!isPromise) {
    return next(action);
  }

  // This is the convention-based promise middleware.
  // Ideally, all "async actions" would go through this pathway.
  const { promise, type, payload, meta } = action;

  // The first dispatched action type will have a "_REQUEST" suffix, so if the original action type
  // already ends with "_REQUEST" it is sliced here.
  const hasRequestType = type.substr(type.length - 8) === '_REQUEST';
  const actionType = hasRequestType ? type.slice(0, -8) : type;

  // It is sometimes useful to be able to track the actions and associated promise lifecycle with a
  // sort of unique identifier.
  const transactionId = uuid.v4();
  const initialPayload = payload;

  // Dispatch the _REQUEST type action
  store.dispatch({
    type: `${actionType}_REQUEST`,
    payload,
    meta: { ...meta, transactionId },
  });
  handleEventHook(meta, 'onStart', payload, store.getState);

  // Prepare the _SUCCESS type action
  const success = data => {
    store.dispatch({
      type: `${actionType}_SUCCESS`,
      payload: data,
      meta: { ...meta, initialPayload, transactionId },
    });
    handleEventHook(meta, 'onSuccess', data, store.getState);
    handleEventHook(meta, 'onFinish', true, store.getState);
  };

  // Prepare the _FAILURE type action
  const failure = error => {
    store.dispatch({
      type: `${actionType}_FAILURE`,
      payload: error,
      error: true,
      meta: { ...meta, initialPayload, transactionId },
    });
    handleEventHook(meta, 'onFailure', error, store.getState);
    handleEventHook(meta, 'onFinish', false, store.getState);
  };

  // Return the promise.
  // In this case, when users dispatch an action with a promise payload, they can `.then` it.
  return promise.then(success, failure);
};

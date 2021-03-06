# redux-pinky <img src="http://vignette3.wikia.nocookie.net/pacman/images/1/1f/PinkyNew.png/revision/latest?cb=20160603182431" width="110" align="left">
#### Yet another Redux middleware for dispatching async actions
<br/>

# Disclaimer
This middleware is a rip-off of [redux-pack](https://github.com/lelandrichardson/redux-pack): we just needed a more standard way of handling the actions :shaved_ice:

# Setup
This library is available on npm, install it with: `npm install --save redux-pinky`.

Then connect it to the store like all the other middlewares (order matters!):
```javascript
import reduxPinky from 'redux-pinky'

...

applyMiddleware([reduxThunk, reduxPinky, reduxLogger])
```

# Usage
The aim of redux-pinky is to provide an easy way to dispatch async actions.  
To use it just dispatch an action with a `promise` field:  
```javascript
const login = (email, password) => ({
  type: 'LOGIN',
  promise: yourAPI.login(email, password)
})
```

Whenever an action has a `promise` field it will be handled by redux-pinky, that will always dispatch the following:
- `{ type: LOGIN_REQUEST }`: Dispatched immediately
- `{ type: LOGIN_SUCCESS, payload: result }`: Dispatched only if the promise succeeds (the result of the promise is in the payload field)
- `{ type: LOGIN_FAILURE, payload: error }`: Dispatched only if the promise fails (the result of the promise is in the payload field)

Since release 2.0 you can also directly dispatch an action with the type `LOGIN_REQUEST` instead of `LOGIN` (just a matter of taste, redux-pinky will dispatch `LOGIN_REQUEST` regardless). 

# Adding side-effects with event hooks
You might want to add side effects (like sending analytics events or navigate to different views) based on promise results.
You can do it using the hooks of the `meta` object of the action.

Here are the available hooks and their associated payload:
- onStart, function called with the initial action payload value
- onFinish, function called with true if the promise resolved, false otherwise
- onSuccess, function called with the promise resolution value
- onFailure, function called with the promise error

The last parameter of all the above functions is the store state (at the hook call time).

# Examples
#### Basic usage:
```javascript
const initializeApp = () => ({
  type: 'INITIALIZE_APP',
  promise: yourAPI.initialize()
})
```
#### A simple way to dispatch a series of promises/async operations usinc `async-await`:
```javascript
const initializeApp = () => ({
  type: 'INITIALIZE_APP',
  promise: (async () => {
    await yourAPI.initializeAPI()
    return yourAPI.login(email, password)
  })()
})
```
#### Send analytics when an user downloads a file:
```javascript
const downloadFile = (fileId) => {
  return {
    type: 'DOWNLOAD_FILE',
    promise: yourAPI.downloadFile(fileId),
    meta: {
      onSuccess: (result, getState) => {
        const userId = getState().currentUser.id
        sendAnalytics('USER_DOWNLOADED_A_FILE', userId, fileId)
      }
    }
  }
}
```
#### Show an alert when the promise fails (React-Native):
```javascript
const checkCredentials = (fileId) => {
  return {
    type: 'CHECK_CREDENTIALS',
    promise: yourAPI.checkCredentials(userId),
    meta: {
      onFailure: (error, getState) => {
        Alert.alert('Credentials check error', error.message)
      }
    }
  }
}
```

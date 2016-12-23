# redux-pinky <img src="http://vignette3.wikia.nocookie.net/pacman/images/1/1f/PinkyNew.png/revision/latest?cb=20160603182431" width="110" align="left">
#### Yet another Redux middleware for dispatching async actions
<br/>

# Setup
This library is available on npm, install it with: `npm install --save redux-pinky`.

To use it just connect it to the store like all the other middlewares (order matters!):
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

The above action will result in the dispatch of the following actions:
- When the action is dispatched (immediately): `{ type: LOGIN_REQUEST }`
- If the promise succeeds: `{ type: LOGIN_SUCCESS, payload: result }`, with the result of the promise in the payload field
- If the promise fails: `{ type: LOGIN_FAILURE, payload: error }`, with the rejection error of the promise in the payload field

# Credits
This middleware is just a more "declarative" version of [redux-pack](https://github.com/lelandrichardson/redux-pack): no `handler`, just actions.

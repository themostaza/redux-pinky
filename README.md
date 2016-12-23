# redux-pink <img src="http://www.clipartbest.com/cliparts/MiL/GLM/MiLGLM9oT.png" width="110" align="left">
#### Yet another Redux middleware for dispatching async actions
<br/>

# Setup
This library is available on npm, install it with: `npm install --save redux-pink`.

To use it just connect it to the store like all the other middlewares (order matters!):
```javascript
import reduxPink from 'redux-pink'

...

applyMiddleware([reduxThunk, reduxPink, reduxLogger])
```

# Usage
The aim of redux-pink is to provide an easy way to dispatch async actions.  
To use it just dispatch an action with a `promise` field:  
```javascript
const login = (email, password) => ({
  type: 'LOGIN',
  promise: yourAPI.login(email, password)
})
```

The above action will result in the dispatch of the following actions: 
- `{ type: LOGIN_REQUEST }`: When the action is dispatched (immediately). 
- If the promise succeeds: `{ type: LOGIN_SUCCESS, payload: result }`, with the result of the promise in the payload field.
- If the promise fails: `{ type: LOGIN_FAILURE, payload: error }`, with the rejection error of the promise in the payload field.

# Credits
This middleware is just a more "declarive" version of [redux-pack](https://github.com/lelandrichardson/redux-pack): no `handler`, just actions.

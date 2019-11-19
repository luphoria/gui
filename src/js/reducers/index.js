import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import deviceReducer from './deviceReducer';
import releaseReducer from './releaseReducer';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  devices: deviceReducer,
  // deployments: deploymentReducer,
  releases: releaseReducer,
  users: userReducer
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default store;

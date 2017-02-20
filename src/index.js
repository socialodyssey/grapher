import React         from 'react';
import ReactDOM      from 'react-dom';
import App           from './App';
import createHistory from 'history/createHashHistory';
import './index.css';

const history = createHistory({ queryKey: false });

ReactDOM.render(
  <App history={history} />,
  document.getElementById('root')
);

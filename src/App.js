import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './Home';
import Create from './Create';
import Join from './Join';
import Chat from './Chat';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/Create" render={(props) => <Create {...props}/>}/>
          <Route path="/Join" component={Join}/>
          <Route path="/Chat/:id?" render={(props) => <Chat {...props}/>}/>
          <Route path="/" component={Home}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;

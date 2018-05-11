import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './Home';
import Create from './Create';
import Join from './Join';
import Chat from './Chat';


class App extends Component {
  constructor(props){
    super(props);
    let user = localStorage.appUser ? JSON.parse(localStorage.appUser) : {};
    this.state = { user:user };
  }

  updateUser(newUser){
    console.log(newUser);
    localStorage.appUser = JSON.stringify(newUser);
    this.setState({user:newUser});
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/Create" render={(props) => <Create {...props} onUserChange={this.updateUser.bind(this)} />}/>
          <Route path="/Join" render={(props) => <Join {...props} onUserChange={this.updateUser.bind(this)} />}/>
          <Route path="/Chat/:id?" render={(props) => <Chat {...props} user={this.state.user} />}/>
          <Route path="/" component={Home}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;

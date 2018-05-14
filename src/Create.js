import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

class Create extends Component {
  constructor(props){
    super(props);
    this.state = localStorage.appCreate ? JSON.parse(localStorage.appCreate) : {topologyServer:'p5-topology.herokuapp.com', incomingPort:3333, outgoingPort:3444, joinPort:3555, minNodes:0, maxNodes:100};
  }

  createNetwork(e){
    e.preventDefault();
    let self = this;
    let history = this.props.history;
    let params = {
      server:this.state.topologyServer,
      opts:{
        sendPort:parseInt(this.state.incomingPort),
        receivePort:parseInt(this.state.outgoingPort),
        joinPort:parseInt(this.state.joinPort)
      }
    };

    ipcRenderer.send("CreateNetwork", params);
    ipcRenderer.on("Network Created", function(evt, data) {
      let user = Object.assign(data, self.state);
      self.props.onUserChange(user);
      history.push('/Chat');
    });

    //Save form settings for next time
    localStorage.appCreate = JSON.stringify(this.state);
  }

  onChange(e){
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="create">
        <Header subtitle="Create a Network"/>
        <form onSubmit={this.createNetwork.bind(this)}>
          <table className="formTable">
            <tbody>
              <tr>
                <td>
                  <label>Topology Server</label>
                </td>
                <td>
                  <input className="url" name="topologyServer" type="text" value={this.state.topologyServer} onChange={this.onChange.bind(this)}/>
                </td>
              </tr>
              <tr>
                <td>
                  <label>Incoming UDP port</label>
                </td>
                <td>
                  <input className="port" name="incomingPort" type="text" value={this.state.incomingPort} onChange={this.onChange.bind(this)} />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Outgoing UDP port</label>
                </td>
                <td>
                  <input className="port" name="outgoingPort" type="text" value={this.state.outgoingPort} onChange={this.onChange.bind(this)} />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Join TCP port</label>
                </td>
                <td>
                  <input className="port" name="joinPort" type="text" value={this.state.joinPort} onChange={this.onChange.bind(this)} />
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <Link className="btn btn-light" to="/">Back</Link>
            <input className="btn" type="submit" value="Create"/>
          </p>
        </form>
      </div>
    );
  }
}

export default Create;
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

class Join extends Component {
  constructor(props){
    super(props);
    this.state = {p5NodeAddress:'192.168.1.2', p5NodePort:3555, incomingPort:2333, outgoingPort:2444, joinPort:2555, minNodes:0, maxNodes:100};
  }

  joinNetwork(e){
    e.preventDefault();
    let self = this;
    let history = this.props.history;
    let params = {
      nodeAddress:this.state.p5NodeAddress,
      nodePort:this.state.p5NodePort,
      minNodes:this.state.minNodes,
      maxNodes:this.state.maxNodes,
      opts:{
        sendPort:parseInt(this.state.incomingPort),
        receivePort:parseInt(this.state.outgoingPort),
        joinPort:parseInt(this.state.joinPort)
      }
    };

    ipcRenderer.send("JoinNetwork", params);
    ipcRenderer.on("Network Joined", function(evt, data) {
        let user = Object.assign(data, self.state);
        self.props.onUserChange(user);
        history.push('/Chat');
    });
  }

  onChange(e){
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="join">
        <Header subtitle="Join a Network"/>
        <form onSubmit={this.joinNetwork.bind(this)}>
          <table className="formTable">
            <tbody>
              <tr>
                <td>
                  <label>P5 Node</label>
                </td>
                <td>
                  <input className="address" name="p5NodeAddress" placeholder="address" type="text" value={this.state.p5NodeAddress} onChange={this.onChange.bind(this)} />
                  <span>:</span>  
                  <input className="port" name="p5NodePort" placeholder="port" type="text" value={this.state.p5NodePort} onChange={this.onChange.bind(this)} />
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
              <tr>
                <td>
                  <label>Security Range</label>
                </td>
                <td>
                  <input className="security" name="minNodes" type="text" value={this.state.minNodes} onChange={this.onChange.bind(this)} />
                  <span>-</span> 
                  <input className="security" name="maxNodes" type="text" value={this.state.maxNodes} onChange={this.onChange.bind(this)} />
                </td>
              </tr>
              <tr>

              </tr>
            </tbody>
          </table>
          <p>
            <Link className="btn btn-light" to="/">Back</Link>
            <input className="btn" type="submit" value="Join"/>
          </p>
        </form>
      </div>
    );
  }
}

export default Join;
import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

export class AddContactModal extends Component {
	constructor(props){
    	super(props);
    	this.state = {key:'', keyType:'asym', alias:undefined, channel:undefined};
  	}

	onChange(e){
    	this.setState({ [e.target.name]: e.target.value });
  	}

  	addContact(){
  		let self = this;
		let newContact = {keyType:'sym', messages:[]};
		newContact.channel = this.state.channel || '';
		if(this.state.alias) newContact.alias = this.state.alias;

		if(this.state.keyType === 'asym') {
			console.log(this.state.key);
	    	ipcRenderer.send("SendSynMessage", this.state.key, this.state.channel);
	    	ipcRenderer.on("SynMessageSent", function(evt, payload){
	    		newContact.key = payload.key;
	    		self.setState({ key: '' });
	    		self.props.addContact(newContact);
	    		self.props.handleClose();
	    	});
		} else {
	    	newContact.key = this.state.key;
	    	this.props.addContact(newContact);
	    	this.props.handleClose();
		}
  	}

	render(){
		return(
	        <Modal show={this.props.show} onHide={this.props.handleClose} dialogClassName="add-contact-modal">
	          <Modal.Header closeButton>
	            <Modal.Title>Add Contact</Modal.Title>
	          </Modal.Header>
	          <Modal.Body>
		        <form>
		        	<label>Name </label>
		        	<input name="alias" type="text" placeholder="optional" value={this.state.alias} onChange={this.onChange.bind(this)}/>
	      			<label>Channel</label>
                  	<input id="channel" name="channel" type="text" placeholder="opt" value={this.state.channel} onChange={this.onChange.bind(this)} />
                  	<br/>
                  	<label>Key</label>
                  	<div className="radios">
	                  	<label>
				        	<input name="keyType" type="radio" value="asym" checked={this.state.keyType === 'asym'} onChange={this.onChange.bind(this)} />
				        	<span> New </span>
				      	</label>
				      	<label id="radio-2">
				        	<input name="keyType" type="radio" value="sym" checked={this.state.keyType === 'sym'} onChange={this.onChange.bind(this)} />
				        	<span> Imported </span>
				      	</label>
			      	</div>
                  	<br/>
                  	<textarea name="key" placeholder="Type or Paste Encryption Key" value={this.state.key} onChange={this.onChange.bind(this)} />
		        </form>
	          </Modal.Body>
	          <Modal.Footer>
	            <button className="btn btn-light" onClick={this.props.handleClose}>Close</button>
	            <button className="btn" onClick={this.addContact.bind(this)} disabled={!this.state.key}>Add</button>
	          </Modal.Footer>
	        </Modal>
		);
	}
}

export class ContactDetailsModal extends Component {
	constructor(props) {
		super(props);
		this.state = { edit:false, alias:this.props.contact.alias, channel:this.props.contact.channel};
	}

	onChange(e){
    	this.setState({ [e.target.name]: e.target.value });
  	}

  	showEdit(){
  		this.setState({ edit:true});
  	}

  	hideEdit(){
  		this.setState({ edit:false });
  	}


	closeModal(){
		this.setState({ edit:false });
		this.props.handleClose();
	}

	saveContact(){
		this.setState({ edit:false });
		this.props.saveContact({alias:this.state.alias, channel:this.state.channel});
	}

	blockContact(){
		this.setState({ edit:false });
		this.props.blockContact();
	}

	render(){
		let contact = this.props.contact;
		let edit = this.state.edit;

		return(
	        <Modal show={this.props.show} onHide={this.props.handleClose} dialogClassName="contact-details-modal">
	          <Modal.Header closeButton>
	            <Modal.Title>Contact Details</Modal.Title>
	          </Modal.Header>
	          <Modal.Body>
		        <form>
		        	<label>Name </label>
		        	{edit && <input name="alias" type="text" placeholder="optional" value={this.state.alias} onChange={this.onChange.bind(this)} />}
		        	{!edit && <strong className="alias">{contact.alias}</strong>}
	      			<label>Channel </label>
                  	{edit && <input id="channel" name="channel" type="text" placeholder="opt" value={this.state.channel} onChange={this.onChange.bind(this)} />}
                  	{!edit && <strong className="channel">{contact.channel}</strong>}
                  	<br/>
                  	<label>Key </label>
                  	<strong>{contact.key}</strong>
		        </form>
	          </Modal.Body>
	          <Modal.Footer>
	          	<button className="btn btn-danger pull-left" onClick={this.props.blockContact.bind(this)}>Block</button>
	          	{!edit && <button className="btn btn-light" onClick={this.closeModal.bind(this)}>Close</button>}
	          	{edit && <button className="btn btn-light" onClick={this.hideEdit.bind(this)}>Cancel</button>}
	          	{edit && <button className="btn btn-light" onClick={this.saveContact.bind(this)}>Save</button>}
	          	{!edit && <button className="btn" onClick={this.showEdit.bind(this)}>Edit</button>}
	          </Modal.Footer>
	        </Modal>
		);
	}
}

export class MyInfoModal extends Component {
	constructor(props){
		super(props);
		this.state = {keyCopied:false};
	}


	copyKeyToClipboard() {
	  electron.clipboard.writeText(this.props.user.key);
	  this.setState({ keyCopied:true });
	  console.log('Key copied!');
	}

	closeModal(){
		this.setState({ keyCopied:false });
		this.props.handleClose();
	}

	render(){
		let user = this.props.user;

		return(
	        <Modal show={this.props.show} onHide={this.closeModal.bind(this)} dialogClassName="my-info-modal">
	          <Modal.Header closeButton>
	            <Modal.Title>My Info</Modal.Title>
	          </Modal.Header>
	          <Modal.Body>
		          <table className="formTable">
		            <tbody>
		              <tr>
		                <td>
		                  <label>Join Address</label>
		                </td>
		                <td>
		                  <strong>{user.ip} : {user.joinPort}</strong>  
		                </td>
		              </tr>
		              <tr>
		                <td>
		                  <label>UDP Ports</label>
		                </td>
		                <td>
		                	<strong>{user.incomingPort}, {user.outgoingPort}</strong>
		                </td>
		              </tr>
		              <tr>
		                <td>
		                  <label>Security Range</label>
		                </td>
		                <td>
		                	<strong>{user.minNodes} - {user.maxNodes}</strong>
		                </td>
		              </tr>
		              <tr>
		                <td>
		                  <label>Comm. Channel</label>
		                </td>
		                <td>
		                	<strong>{ user.channel === '' ? 'root' : user.channel }</strong>
		                </td>
		              </tr>
		              <tr>
		                <td>
		                  <label>Topology Server</label>
		                </td>
		                <td>
		                	<a href={"http://" + user.topologyServer} target="_blank"><strong>{user.topologyServer}</strong></a>
		                </td>
		              </tr>
		              <tr>
		              	<td>Public Key</td>
		              	<td><button className="btn" onClick={this.copyKeyToClipboard.bind(this)}>Copy Key</button></td>
		              </tr>
		            </tbody>
		          </table>
		          {this.state.keyCopied ? (<p className="text-center"><strong>Key copied to your clipboard</strong></p>) : (<br/>)}
	          </Modal.Body>
	          <Modal.Footer>
	            <button className="btn" onClick={this.closeModal.bind(this)}>OK</button>
	          </Modal.Footer>
	        </Modal>
		);
	}
}


export class ParentLeftModal extends Component {
	constructor(props){
    	super(props);
    	this.state = {show:false};

    	ipcRenderer.on("parentLeft", () => {
    		this.setState({show:true});
    	});
  	}

  	closeModal(){
  		this.setState({show:false});
  		this.props.handleClose();
  	}

	render(){
		return(
	        <Modal show={this.state.show} onHide={this.closeModal.bind(this)} dialogClassName="parent-left-modal">
	          <Modal.Header closeButton>
	            <Modal.Title>Parent Node Left</Modal.Title>
	          </Modal.Header>
	          <Modal.Body>
	          	<p>You must rejoin the network because your parent node has left.</p> 
	          </Modal.Body>
	          <Modal.Footer>
	            <button className="btn" onClick={this.closeModal.bind(this)}>Rejoin</button>
	          </Modal.Footer>
	        </Modal>
		);
	}
}
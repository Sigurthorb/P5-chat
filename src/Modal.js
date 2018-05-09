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
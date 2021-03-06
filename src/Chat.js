import React, { Component } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import { Glyphicon } from 'react-bootstrap';
import moment from 'moment';
import { AddContactModal, ContactDetailsModal, MyInfoModal, ParentLeftModal } from './Modal';
import Dispatcher from "./Dispatcher";

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

function findIdxBykey(conversations, key){
  for(let i=0; i<conversations.length; i++){
    if(conversations[i].key === key )
      return i;
  }
  return -1;
}

class Chat extends Component {
  constructor(props){
    super(props);
    let self = this;
    let data = localStorage.appData ? JSON.parse(localStorage.appData) : [];
    let keys = data.map(c => c.key);
    //Set keys on the db
    ipcRenderer.send("AddSymmetricKeys", keys);

    this.state = {
      appData:data,
        // {id:0, key:"ThisIsTheSymmetricKey", keyType:"sym", alias:"Ron", channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Hello there ladies and gentleman", sent:false}, {timestamp:"4/26/18 @ 4:30pm", message:"Are you ready to rock", sent:true}]},
        // {id:1, key:"thisistherightlengthofkeyforenca", keyType:"sym",  channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Looking for a complication", sent:false}]},
        // {id:2, key:"thisistherightlengthofkeyforencb", keyType:"sym",  channel:"", messages:[]}
      addContactShow:false,
      contactDetailsShow:false,
      activeContact:{},
      myInfoShow:false
    };

    ipcRenderer.on("synMessage", function(evt, payload) {
        console.log("New Message ", payload);
        self.pushContact({key:payload.symmetricKey, keyType:'sym', alias:'', channel:payload.channel, messages:[]});
    });

    ipcRenderer.on("dataMessage", function(evt, payload) {
        console.log("New Message ", payload.data);
        self.pushMessage(payload.data, false, payload.symmetricKey);
    });
  }

  componentDidMount(){
    Dispatcher.register(e => {
      switch(e.actionType) {
        case 'show-contact-details':
          this.setState({contactDetailsShow:true, activeContact:e.payload});
          break;
      }
    });
  }

  pushMessage(newMsg, sent, key){
    this.setState((state, props) => {
      let conversationId = key ? findIdxBykey(state.appData, key) : props.match.params.id;
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object
      let messages = newData[conversationId].messages;

      messages.push({message:newMsg, sent:sent, timestamp:moment().valueOf()});
      newData.sort((a,b) => { b.messages[b.messages.length-1].timestamp - a.messages[a.messages.length-1].timestamp });
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData };
    });
  }

  pushContact(newContact){
    //Add key to db storage
    ipcRenderer.send("AddSymmetricKey", newContact.key);
    this.setState((state, props) => {
      newContact.id = state.appData.length;
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object
      newData.push(newContact);
      props.history.push('/Chat/' + newContact.id);
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData };
    });
  }

  pullContact(contact){
    ipcRenderer.send("RemoveSymmetricKey", contact.key);
    this.setState((state, props) => {
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object
      let idx = findIdxBykey(newData, state.activeContact.key);
      if(idx > -1){
        newData.splice(idx, 1);
      }
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData, contactDetailsShow:false };
    });
  }

  updateContact(contact){
     this.setState((state, props) => {
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object
      let idx = findIdxBykey(newData, state.activeContact.key);
      if(idx > -1){
        if(contact.alias) newData[idx].alias = contact.alias;
        if(contact.channel) newData[idx].alias = contact.channel;
      }
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData, contactDetailsShow:false };
    });

  }

  showAddContact(){
    this.setState({addContactShow:true});
  }

  hideAddContact(){
    this.setState({addContactShow:false});
  }

  hideContactDetails(){
    this.setState({contactDetailsShow:false});
  }

  showMyInfo(){
    this.setState({myInfoShow:true});
  }

  hideMyInfo(){
    this.setState({myInfoShow:false});
  }

  rejoin(){
    this.props.history.push('/Join');
  }


  render() {
    let data = this.state.appData;
    //TO DO, search for the object with the correct id (id may not always be the index)
    let activeConversation = this.props.match.params.id ? data[this.props.match.params.id] : null;

    if (!localStorage.appUser) {
      return <Redirect to='/' />
    }

    return (
      <div className="chat">
        <ChatHeader addContact={this.showAddContact.bind(this)} myInfo={this.showMyInfo.bind(this)} />
        <ChatHistory conversations={data} />
        <ChatConversation conversation={activeConversation} />
        <ChatInput activeKey={activeConversation && activeConversation.key} keyType={activeConversation && activeConversation.keyType} onSend={this.pushMessage.bind(this)} disabled={!activeConversation} />
        <AddContactModal show={this.state.addContactShow} handleClose={this.hideAddContact.bind(this)} addContact={this.pushContact.bind(this)} />
        <ContactDetailsModal show={this.state.contactDetailsShow} handleClose={this.hideContactDetails.bind(this)} blockContact={this.pullContact.bind(this)} saveContact={this.updateContact.bind(this)} contact={this.state.activeContact} />
        <MyInfoModal show={this.state.myInfoShow} handleClose={this.hideMyInfo.bind(this)} user={this.props.user} />
        <ParentLeftModal handleClose={this.rejoin.bind(this)} />
      </div>
    );
  }
}

class ChatHeader extends Component {
  render() {
    return (
      <div className="chat-header">
        <button onClick={this.props.addContact} className="btn btn-light">Add Contact</button>
        <h3 className="logo"><em>P5</em> Chat</h3>
        <button onClick={this.props.myInfo} className="btn btn-light">My Info</button>
      </div>
    );
  }
}

class ChatHistory extends Component {
  render() {
    let historyItems;

    if(this.props.conversations.length) {
      historyItems = this.props.conversations.map(c => <ChatHistoryItem key={c.id} conversation={c} /> )
    } else {
      historyItems = <h4 className="empty-msg">No Contacts</h4>
    }

    return (
      <div className="chat-history">
        <ul>{historyItems}</ul>
      </div>
    );
  }
}

class ChatConversation extends Component {
  componentDidMount(){
    let objDiv = document.getElementById("chat-conversation");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  componentDidUpdate(){
    let objDiv = document.getElementById("chat-conversation");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  render() {
    let messages;

    if(this.props.conversation) {
      if(this.props.conversation.messages.length) {
        messages = this.props.conversation.messages.map(m => <ChatMessageItem message={m} /> )
      } else {
        messages = <li><h1 className="empty-msg">No Messages</h1></li>
      }

    } else {
      messages = <li><h1 className="empty-msg">Select a Contact</h1></li>;
    }

    return (
      <div id="chat-conversation" className="chat-conversation">
        <p className="punch-line">Good thing about UDP jokes is I don't care if you get them or not</p>
        <ul>{messages}</ul>
      </div>
    );
  }
}

class ChatHistoryItem extends Component {
  showContact(evt){
      evt.preventDefault();
      Dispatcher.dispatch({
          actionType: 'show-contact-details',
          payload: this.props.conversation
      });
  }

  render() {
    let conv = this.props.conversation;
    let lastMsg = conv.messages[conv.messages.length-1] || {timestamp:'', message:''};
    let timestamp = moment(lastMsg.timestamp);
    let timeFormat = timestamp.isSame(moment(), 'day') ? 'h:mm a' : 'MM/DD/YY';
    return (
      <li className="chat-history-item">
        <NavLink to={'/Chat/' + conv.id}>
          <p className="title"><strong>{conv.alias || conv.key}</strong><em>{ lastMsg.timestamp && timestamp.format(timeFormat)}</em><Glyphicon onClick={this.showContact.bind(this)} glyph="info-sign" /></p>
          <p className="subtitle">{lastMsg.message}</p>
        </NavLink>
      </li>
    );
  }
}

class ChatMessageItem extends Component {
  render() {
    let msg = this.props.message;
    let timestamp = moment(msg.timestamp);
    let timeFormat = timestamp.isSame(moment(), 'day') ? 'h:mm a' : 'MM/DD/YY @ h:mm a';

    return (
      <li className={"chat-message-item " + (msg.sent ? "right" : "left")}>
        <div>
          <p className="conversation">{msg.message}</p>
          <p className="timestamp">{ timestamp.format(timeFormat) }</p>
        </div>
      </li>
    );
  }
}

class ChatInput extends Component {
  constructor(props){
    super(props);
    this.state = {messageInput:''};
  }

  onChange(e){
    this.setState({ [e.target.name]: e.target.value });
  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.length && !this.props.disabled) {
      e.preventDefault();
      this.sendMessage();
      this.setState({messageInput:""});
    }
  }

  sendMessage(){
    let eventType = this.props.keyType === 'sym' ? "SendDataMessage" : "SendSynMessage";
    ipcRenderer.send(eventType, this.props.activeKey, this.state.messageInput);
    this.props.onSend(this.state.messageInput, true);
    this.setState({messageInput:""});
  }

  render() {
    return (
      <div className="chat-input">
        <textarea name="messageInput" placeholder="Type a message" value={this.state.messageInput} onChange={this.onChange.bind(this)}  disabled={this.props.disabled} onKeyPress={this._handleKeyPress} />
        <button className="send-btn btn" onClick={this.sendMessage.bind(this)} disabled={this.props.disabled || !this.state.messageInput}>Send</button>
      </div>
    );
  }
}

export default Chat;
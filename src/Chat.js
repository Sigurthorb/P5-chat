import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { AddContactModal, MyInfoModal, ParentLeftModal } from './Modal';

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

    this.state = {
      appData:data,
        // {id:0, key:"ThisIsTheSymmetricKey", keyType:"sym", alias:"Ron", channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Hello there ladies and gentleman", sent:false}, {timestamp:"4/26/18 @ 4:30pm", message:"Are you ready to rock", sent:true}]},
        // {id:1, key:"thisistherightlengthofkeyforenca", keyType:"sym",  channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Looking for a complication", sent:false}]},
        // {id:2, key:"thisistherightlengthofkeyforencb", keyType:"sym",  channel:"", messages:[]}
      addContactShow:false,
      myInfoShow:false
    };

    ipcRenderer.on("synMessage", function(evt, payload) {
        console.log("New Message ", payload);
        self.pushContact({key:payload.symmetricKey, keyType:'sym', alias:'', channel:payload.channel, messages:[]});
    });

    ipcRenderer.on("dataMessage", function(evt, payload) {
        console.log("New Message ", payload.data);
        self.pushMessage(payload.data, false, "5/7/18 @ 1:28pm", payload.symmetricKey); //TO DO, use real date timestamp
    });
  }

  pushMessage(newMsg, sent, timestamp, key){
    this.setState((state, props) => {
      let conversationId = key ? findIdxBykey(state.appData, key) : props.match.params.id;
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object
      let messages = newData[conversationId].messages;

      messages.push({message:newMsg, sent:sent, timestamp:timestamp});
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData };
    });
  }

  pushContact(newContact){
    this.setState((state, props) => {
      newContact.id = state.appData.length;
      let newData = JSON.parse(JSON.stringify(state.appData)); //Deep Clone the Object

      newData.push(newContact);
      props.history.push('/Chat/' + newContact.id);
      localStorage.appData = JSON.stringify(newData);
      return { appData:newData };
    });
  }

  showAddContact(){
    this.setState({addContactShow:true});
  }

  hideAddContact(){
    this.setState({addContactShow:false});
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

    return (
      <div className="chat">
        <ChatHeader addContact={this.showAddContact.bind(this)} myInfo={this.showMyInfo.bind(this)} />
        <ChatHistory conversations={data}/>
        <ChatConversation conversation={activeConversation} />
        <ChatInput activeKey={activeConversation && activeConversation.key} keyType={activeConversation && activeConversation.keyType} onSend={this.pushMessage.bind(this)} disabled={!activeConversation} />
        <AddContactModal show={this.state.addContactShow} handleClose={this.hideAddContact.bind(this)} addContact={this.pushContact.bind(this)} />
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
      <div className="chat-conversation">
        <ul>{messages}</ul>
      </div>
    );
  }
}

class ChatHistoryItem extends Component {
  render() {
    let conv = this.props.conversation;
    let lastMsg = conv.messages[conv.messages.length-1] || {timestamp:'', message:''};
    return (
      <li className="chat-history-item">
        <NavLink to={'/Chat/' + conv.id}>
          <p className="title"><strong>{conv.alias || conv.key}</strong><em>{lastMsg.timestamp}</em></p>
          <p className="subtitle">{lastMsg.message}</p>
        </NavLink>
      </li>
    );
  }
}

class ChatMessageItem extends Component {
  render() {
    let msg = this.props.message;

    return (
      <li className={"chat-message-item " + (msg.sent ? "right" : "left")}>
        <div>
          <p className="conversation">{msg.message}</p>
          <p className="timestamp">{msg.timestamp}</p>
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
    this.props.onSend(this.state.messageInput, true, "5/7/18 @ 1:28pm"); //TO DO, use real date timestamp
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
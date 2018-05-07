import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

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

    this.state = {
      appData:[
        {id:0, key:"ThisIsTheSymmetricKey", keyType:"sym", alias:"Ron", channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Hello there ladies and gentleman", sent:false}, {timestamp:"4/26/18 @ 4:30pm", message:"Are you ready to rock", sent:true}]},
        {id:1, key:"thisistherightlengthofkeyforenca", keyType:"sym",  channel:"", messages:[{timestamp:"4/26/18 @ 4:30pm", message:"Looking for a complication", sent:false}]},
        {id:2, key:"thisistherightlengthofkeyforencb", keyType:"sym",  channel:"", messages:[]}
      ]
    };

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

      return { appData:newData };
    });
  }

  render() {
    let data = this.state.appData;
    console.log(this.props.match.params);
    //TO DO, search for the object with the correct id (id may not always be the index)
    let activeConversation = this.props.match.params.id ? data[this.props.match.params.id] : null;

    return (
      <div className="chat">
        <ChatHeader />
        <ChatHistory conversations={data}/>
        <ChatConversation conversation={activeConversation} />
        <ChatInput activeKey={activeConversation && activeConversation.key} keyType={activeConversation && activeConversation.keyType} onSend={this.pushMessage.bind(this)}/>
      </div>
    );
  }
}

class ChatHeader extends Component {
  render() {
    return (
      <div className="chat-header">
        <button className="btn btn-light">Add Contact</button>
        <h3 className="logo"><em>P5</em> Chat</h3>
        <button className="btn btn-light">My Info</button>
      </div>
    );
  }
}

class ChatHistory extends Component {
  render() {
    let historyItems = this.props.conversations.map(c => <ChatHistoryItem key={c.id} conversation={c} /> )
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
      messages = <li><h1 className="empty-msg">Select a Conversation</h1></li>;
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

  sendMessage(){
    let eventType = this.props.keyType === 'sym' ? "SendDataMessage" : "SendSynMessage";
    ipcRenderer.send(eventType, this.props.activeKey, this.state.messageInput);
    this.props.onSend(this.state.messageInput, true, "5/7/18 @ 1:28pm"); //TO DO, use real date timestamp
    this.setState({messageInput:""});
  }

  render() {
    return (
      <div className="chat-input">
        <textarea name="messageInput" placeholder="Type a message" value={this.state.messageInput} onChange={this.onChange.bind(this)} />
        <button className="send-btn btn" onClick={this.sendMessage.bind(this)}>Send</button>
      </div>
    );
  }
}

export default Chat;
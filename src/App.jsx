import React, { Component } from "react";
import NavBar from "./NavBar.jsx";
import MessageList from "./MessageList.jsx";
import ChatBar from "./ChatBar.jsx";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: "Anonymous",
      messages: [],
      userCount: 0
    };
  }

  componentDidMount() {
    this.socket = new WebSocket("ws://localhost:9009/ws");
    this.socket.addEventListener("message", event => {
      const data = JSON.parse(event.data);
      if (data.users)
        this.setState({ userCount: data.users });
      if (data.content) {
        this.setState({ messages: [...this.state.messages, data] });
      }
      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 2
      )
        window.scrollTo(0, document.body.scrollHeight);
    });
  }

  // Checks message type and sends to server
  submitMessage = message => {
    const { username, content } = message;
    if (this.state.currentUser !== username) {
      this.socket.send(
        JSON.stringify({
          username,
          type: "postNotification",
          content: `${this.state
            .currentUser} has changed their name to ${username}.`
        })
      );
      this.setState({ currentUser: username });
    }

    const tempMsgs = {
      type: "postMessage",
      username: username,
      content
    };
    this.socket.send(JSON.stringify(tempMsgs));
  };

  render() {
    return (
      <div>
        <NavBar userCount={this.state.userCount} />
        <MessageList messages={this.state.messages} />
        <ChatBar submitMessage={this.submitMessage} />
      </div>
    );
  }
}
export default App;

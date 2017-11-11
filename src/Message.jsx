import React, { Component } from "react";

class Message extends Component {
  render() {
    const { type, content, username, color } = this.props;
    if (type === "incomingNotification") {
      return <div className="message system">{content}</div>;
    }
    // Check for img links in message
    const regex = /\b(https?.*?\.(?:jpe?g|png|gif))\b/gi;
    const message = content => {
      return content.split(regex).map(section => {
        if (regex.test(section)) {
          return <img className="img-message" src={section} />;
        }
        return section;
      });
    };
    return (
      <div className="message">
        <span className="message-username" style={{ color }}>
          {username}
        </span>
        <span className="message-content">{message(content)}</span>
      </div>
    );
  }
}
export default Message;

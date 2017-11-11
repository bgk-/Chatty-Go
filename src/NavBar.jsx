import React, { Component } from "react";

function NavBar({ userCount }) {
  const userCountMessage = userCount === '1' ? "1 user online" : `${userCount} users online`
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        Chatty
        <span className="user-count">{userCountMessage}</span>
      </a>
    </nav>
  );
}
export default NavBar;
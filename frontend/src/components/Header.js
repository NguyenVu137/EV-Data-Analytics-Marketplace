import React from 'react';
import './Header.css';

const Header = ({ user }) => (
  <header className="ev-header">
    <div className="ev-header-left">
      <img src="/logo192.png" alt="EV Data" className="ev-logo" />
    </div>
    <nav className="ev-header-nav">
      <a href="/">Home</a>
      <a href="/explore">Explore Data</a>
      <a href="/providers">For Providers</a>
      <a href="/pricing">Pricing Plans</a>
      <a href="/support">Support/FAQ</a>
      <a href="/login">Login / Register</a>
    </nav>
    <div className="ev-header-user">
      {user && <img src={user.avatar || '/avatar.svg'} alt="User" className="ev-avatar" />}
    </div>
  </header>
);

export default Header;

import React, { Component } from 'react';
import Bounce from 'react-activity/lib/Bounce';
import 'react-activity/lib/Bounce/Bounce.css';

export default class Loader extends Component {
  render() {
    return (
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
            <Bounce size={60} animating={this.props.loading}/>
        </div>
    );
  }
}
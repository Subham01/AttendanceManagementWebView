import React, { Component } from 'react';
import * as firebase from 'firebase';
import styles from './css/style.css';
import pic from './css/logo.png';

class Login extends Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            email: '',
            password: '',
            message:''
        };
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
    login(e) {
        e.preventDefault();
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then((u) => {
        }).catch((error) => {
            this.setState({message: 'Authentication Failed'})
        });
    }

    render() {
        return (
            <div className="wrap">
                <div className="avatar">
                    <img src={pic} alt="Logo" />
                </div>
                <input className="input-style" value={this.state.email}
                    onChange={this.handleChange}
                    name="email" id="exampleInputEmail1"
                    type="text" placeholder="email" required />
                <input className="input-style" value={this.state.password} 
                    onChange={this.handleChange} 
                    name="password" id="exampleInputPassword1" 
                    type="password" placeholder="password" required />
                <p>{this.state.message}</p>
                <button onClick={this.login}>Sign in</button>
            </div>
        );
    }
}
export default Login;
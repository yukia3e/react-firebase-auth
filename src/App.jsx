import React, { Component } from 'react';
import firebase from './firebase';
import SignInScreen from './components/SignInScreen';

class App extends Component {
  state = {
    loading: true,
    user: null,
    email: "",
    roleUser: false,
    roleAdmin: false,
    roleNotification: false,
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user: user,
      })
      if (user) {
        user.getIdTokenResult()
          .then(idTokenResult => {
            console.log(idTokenResult)
            this.setState({
              roleUser: !!idTokenResult.claims.role_user ? idTokenResult.claims.role_user : false,
              roleAdmin : !!idTokenResult.claims.role_admin ? idTokenResult.claims.role_admin : false,
              roleNotification : !!idTokenResult.claims.role_notification ? idTokenResult.claims.role_notification : false,
            });
          })
      }
    });
  }

  logout() {
    firebase.auth().signOut();
  }

  sendMessage() {
    const url = 'http://localhost:8080/api/v1/users';
    const requestOptions = {
      method: 'GET',
    };
    fetch(url, requestOptions);
  }

  sendAuthMessage() {
    firebase.auth().currentUser.getIdTokenResult()
      .then(idTokenResult => {
        console.log(idTokenResult);
        return fetch('http://localhost:8080/api/v1/users', {
          headers: new Headers({ 'Authorization': 'Bearer ' + idTokenResult.token})
        });
      })
      .then(res => res.json())
      .then(
        (result) => {
          let data = result;
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  sendJsonMessage() {
    firebase.auth().currentUser.getIdTokenResult()
      .then(idTokenResult => {
        console.log(idTokenResult);
        const uid = ""
        return fetch('http://localhost:8080/api/v1/users/' + uid + '/edit', {
          method: 'POST',
          headers: new Headers({
            'Authorization': 'Bearer ' + idTokenResult.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            "role_user": true,
            "role_admin": true,
            "role_notification": true,
            "test": true
          })
        });
      })
      .then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  render() {
    if (this.state.loading) return <div>loading</div>;
    return (
      <div>
        {
          !this.state.user ?
          (
            <div>
              <SignInScreen />
            </div>
          ) :
          (
            this.state.roleUser ?
            (
              <>
                <div>Username: {this.state.user && this.state.user.displayName}</div>
                <div>user権限: {this.state.roleUser ? "権限あり" : "権限なし"}</div>
                <div>admin権限: {this.state.roleAdmin ? "権限あり" : "権限なし"}</div>
                <div>notification権限: {this.state.roleNotification ? "権限あり" : "権限なし"}</div>
                <button onClick={this.logout}>Logout</button>
                <br />
                <br />
                <button onClick={this.sendMessage}>Send Message Without Token</button>
                <button onClick={this.sendAuthMessage}>GetUserList</button>
                <button onClick={this.sendJsonMessage}>UpdateUserRole</button>
              </>
            ) :
            (
              <>
                <div>ユーザー登録は完了していますが、管理機能の利用開始がされていません。管理者にロール付与をお願いしてください。</div>
                <button onClick={this.logout}>Logout</button>
              </>
            )
          )
         }
      </div>
    );
  }
}

export default App;
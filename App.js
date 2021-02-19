import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LoginView from './LoginView';
import SignupView from './SignupView';
import TodayView from './TodayView'
import ExercisesView from './ExercisesView'
import ProfileView from './ProfileView'
import MealView from './MealView'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';

import { TouchableOpacity, Image, View, Text, Button } from 'react-native';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      accessToken: undefined,
      username: undefined,
      password: ""
    }

    this.login = this.login.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.revokeAccessToken = this.revokeAccessToken.bind(this);
    this.SignoutButton = this.SignoutButton.bind(this);
    this.myFitTab = this.myFitTab.bind(this);
    
  }

  /**
   * Store the username and accessToken here so that it can be
   * passed down to each corresponding child view.
   */
  login(username, accessToken) {
    this.setState({
      username: username,
      accessToken: accessToken
    });
  }

  setPassword(password){
    this.setState({
      password: password
    });
  }

  /**
   * Revokes the access token, effectively signing a user out of their session.
   */
  revokeAccessToken() {
    this.setState({
      accessToken: undefined
    });
  }
  

  /**
   * Defines a signout button... Your first TODO!
   */
  SignoutButton = () => {
    return <>
      <View style={{ flexDirection: 'row', marginRight: 25 }}>
        
        <TouchableOpacity onPress={() => this.setState({ accessToken: undefined})}>
          <Text>
          <Icon name="sign-out-alt" size={20} color="#900" style={{ marginLeft: 15, margin: 5 }} />
          </Text>
        </TouchableOpacity>
      </View>
    </>
  }

  myFitTab(){
    const Tabs = createBottomTabNavigator();
    return (
      <Tabs.Navigator>
        <Tabs.Screen name="Today" 
        options={{
                  title: 'Today',
                  tabBarIcon: ({ tintColor }) => (
                 <Icon name="apple-alt" size={20} color={"#942a21"}/>
                 )
                }}
        >
        
        {(props) => <TodayView {...props} username={this.state.username} accessToken={this.state.accessToken} revokeAccessToken={this.revokeAccessToken}/>}
        
        </Tabs.Screen>

        <Tabs.Screen name="Exercise"
         options={{
                  title: 'Exercise',
                  tabBarIcon: ({ tintColor }) => (
                 <Icon name="running" size={20} color={"#942a21"}/>
                 )
                }}
        >
       
        {(props) => <ExercisesView {...props} username={this.state.username} accessToken={this.state.accessToken} revokeAccessToken={this.revokeAccessToken}/>}
        </Tabs.Screen>

        <Tabs.Screen name="Meal"
         options={{
                  title: 'Meal',
                  tabBarIcon: ({ tintColor }) => (
                 <Icon name="pizza-slice" size={20} color={"#942a21"}/>
                 )
                }}
        >
        {(props) => <MealView {...props} username={this.state.username} password={this.state.password} accessToken={this.state.accessToken} revokeAccessToken={this.revokeAccessToken} />}
        </Tabs.Screen>

        <Tabs.Screen name="ME"
         options={{
                  title: 'Exercise',
                  tabBarIcon: ({ tintColor }) => (
                 <Icon name="user-alt" size={20} color={"#942a21"}/>
                 )
                }}
        >
        {(props) => <ProfileView {...props} username={this.state.username} accessToken={this.state.accessToken} revokeAccessToken={this.revokeAccessToken} />}
        </Tabs.Screen>
      </Tabs.Navigator>
    )
  }

  /**
   * Note that there are many ways to do navigation and this is just one!
   * I chose this way as it is likely most familiar to us, passing props
   * to child components from the parent.
   * 
   * Other options may have included contexts, which store values above
   * (similar to this implementation), or route parameters which pass
   * values from view to view along the navigation route.
   * 
   * You are by no means bound to this implementation; choose what
   * works best for your design!
   */
  render() {

    // Our primary navigator between the pre and post auth views
    // This navigator switches which screens it navigates based on
    // the existent of an access token. In the authorized view,
    // which right now only consists of the profile, you will likely
    // need to specify another set of screens or navigator; e.g. a
    // list of tabs for the Today, Exercises, and Profile views.
    const AuthStack = createStackNavigator();
    
    return (
      <NavigationContainer>
        <AuthStack.Navigator>
          {!this.state.accessToken ? (
            <>
              <AuthStack.Screen
                name="SignIn"
                options={{
                  title: 'Fitness Tracker Welcome',
                }}
              >
                {(props) => <LoginView {...props} login={this.login} setPassword = {this.setPassword}/>}
              </AuthStack.Screen>

              <AuthStack.Screen
                name="SignUp"
                options={{
                  title: 'Fitness Tracker Signup',
                  tabBarIcon: ({ tintColor }) => (
                 <Icon name="ios-bookmarks" size={20}/>
                 )
                }}
                
              >
                {(props) => <SignupView {...props} />}
              </AuthStack.Screen>
            </>
          ) : (
              <>
                <AuthStack.Screen name="FitnessTracker" options={{
                  headerLeft: this.SignoutButton
                }}
                component={this.myFitTab}>

                  </AuthStack.Screen>            
              </>

            )}
        </AuthStack.Navigator>       
      </NavigationContainer>
    );

  }
}

export default App;

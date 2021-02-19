import React, { Component } from "react";
import {StyleSheet, Platform, Text, View, Button, TextInput, Alert, Modal, TouchableHighlight, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import TimePicker from 'react-native-simple-time-picker';
import moment from "moment";
import base64 from 'base-64';
import Ionicons from 'react-native-vector-icons/Ionicons';

class ExercisesView extends React.Component {
    constructor(props) {
        super(props);
        this.actName = React.createRef();
        this.actDuration = React.createRef();
        this.actCalories = React.createRef();
        this.state = {
            modalVisible: false,
            selectedHours: 0,
            selectedMinutes: 0,
            username: "",
            password: "",
            userProfile: {},
            userActivity: [],
            totalWorkCalorie: "",
            totalCalorie: "",
            accesscode: "",
            errorMessage: "",
            showProfile: false,
            currentDate: "",
            date:"",
            activityname:"",
            activityCalorie: 0,
            aciivityDuration: 0,
            changeDate: "",
            changeCalorie: -1,
            changeDuration: -1,
            changeName: "",
            activityTime: {}
             
        }
   
    }

    componentDidMount() {

        this.updateFromApi();
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
          this.updateFromApi();
        });
    }
    componentWillUnmount() {
    // Remove the event listener
    this.focusListener();
  }

  updateFromApi() {
    console.log("exer's props: "+ this.props)
    
    fetch('https://mysqlcs639.cs.wisc.edu/users/' + this.props.username, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "x-access-token": this.props.accessToken,
        redirect: 'follow'
      }
    })
      .then(response => response.json())
      .then(result => {
        this.setState({userProfile: result});
        this.setState({errorMessage: result.message});
      })
      .then(fetch('https://mysqlcs639.cs.wisc.edu/activities', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "x-access-token": this.props.accessToken,
          redirect: 'follow'
        }
      })
        .then(response2 => response2.json())
        .then(result2 => {
          
          this.setState({userActivity: result2.activities});

          let tempobj = {};
          for (let tempact of result2.activities) {
            tempobj[tempact.id] = tempact.date;
          }
          this.setState({activityTime: tempobj});
          this.setState({errorMessage: result2.message});
          this.setState({currentDate: new Date()});
        })
        .catch(error => this.setState({errorMessage: "error"}))
      )
      .catch(error => this.setState({errorMessage: "error"}));
  }


  
//////////////////////////
  addActivity() {
            let obj = {};
            obj.name = this.state.activityname;
            obj.calories = this.state.activityCalorie;
            obj.duration = this.state.aciivityDuration;
            obj.date = this.state.date;
            this.actName.current.clear();
            this.actCalories.current.clear();
            this.actDuration.current.clear();


    
    fetch('https://mysqlcs639.cs.wisc.edu/activities/' , {
        method: 'POST',
        headers:{"Content-Type": "application/json",
                 "x-access-token": this.props.accessToken,
                 "Authorization": 'Basic ' + base64.encode(this.state.username + ":" + this.state.password)

        },
        body: JSON.stringify(obj),
        redirect: 'follow', 
    })
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("created")) {
        Alert.alert(result.message)
      } else {
        Alert.alert(result.message)
      }
      this.setState({activityname: "", date: "", activityCalorie: 0, aciivityDuration: 0});
      {this.updateFromApi()}
    })
    .catch(error => this.setState({errorMessage: "error"}));
  }

//////////////////////
changeActivity(activityID) {
    let obj = {};
    if (this.state.changeCalorie !== -1) {
      obj.calories = this.state.changeCalorie;
    }
    if (this.state.changeDuration !== -1) {
      obj.duration = this.state.changeDuration;
    }
    if (this.state.changeName !== "") {
      obj.name = this.state.changeName;
    }
    if (this.state.changeDate !== "") {
      obj.date = this.state.changeDate;
    }

    
    
    fetch('https://mysqlcs639.cs.wisc.edu/activities/' + activityID , {
      method: 'PUT',
      headers: {"Content-Type": "application/json",
                 "x-access-token": this.props.accessToken,
                 "Authorization": 'Basic ' + base64.encode(this.state.username + ":" + this.state.password)},
      body: JSON.stringify(obj),
      redirect: 'follow', 
    })
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("updated")) {
        Alert.alert("Successful", result.message)
      } else {
        Alert.alert("Sorry", result.message)
      }
      this.setState({changeCalorie: -1, changeDate: "", changeName: "", changeDuration: -1});
      {this.updateFromApi()}
    })
    .catch(error => this.setState({errorMessage: "error"}));
  }

  generateCard() {

    let activitylist = this.state.userActivity;
    return activitylist.map((key, index) => {
      if (moment(key.date).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')) {
        return (
          
          <Card key={key.id}  containerStyle={{backgroundColor: '#aae3cd', borderRadius: 10}}>
            <View>
               <Text style ={{fontWeight: 'bold'}}>Activity Id: {key.id}</Text>
               <TouchableOpacity style={styles.touchRemoveButton} onPress={() => this.removeActivity(key.id)}> 
                 
                 <Text >
                 <Icon name="minus-circle" size={20} color="#900" style={{ marginRight: 20 }} /></Text>
                  </TouchableOpacity>
            </View>
            <View style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
            
            <DatePicker
                  style={{ marginTop: 11, width: 300}}
                  date = {moment(this.state.activityTime[key.id])}
                  mode="datetime"
                  placeholder="select date"
                  format='MMMM D, YYYY h:mm A'
                  minDate = {new Date(moment().subtract(7,'d'))}
                  maxDate={this.state.currentDate}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      borderColor: '#86878a',
                      marginLeft: 36,
                      borderRadius: 5 
                    },
                    placeholderText: {
                      color: 'black'
                    }
                  }}
                  onDateChange={(date) => {
                    
                    let currTime = Object.assign({}, this.state.activityTime);
                    currTime[key.id] = new Date(date);
                    this.setState({activityTime: currTime});
                    this.setState({changeDate: date}
                  )}}
              />
            </View>
            <Text>  </Text>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
              

              <Text style={{marginTop: 5, width: 70}}>Duration: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 70,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {`${key.duration}`}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeDuration: text})}}
              />
              <Text style={{marginTop: 5, marginLeft: 30, width: 70}}>Calories: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 70,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {`${key.calories}`}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeCalorie: text})}}
              />

              
              
            </View>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: -5, marginBottom: -10, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{marginTop: 6, width: 50}}>Name: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 100,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {key.name}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeName: text})}}
              />
              <TouchableOpacity style={styles.touchButton} onPress={() => this.changeActivity(key.id)}>
                <Text>Submit Changes</Text>

                  
                  
              </TouchableOpacity> 
            </View>
          </Card>
        )
      }
    })
  }

removeActivity(activityid) {
    
    fetch('https://mysqlcs639.cs.wisc.edu/activities/' + activityid, {
      method: 'DELETE',
      headers: {"Content-Type": "application/json",
                "x-access-token": this.props.accessToken,
                "Authorization": 'Basic ' + base64.encode(this.state.username + ":" + this.state.password),
                redirect: 'follow'
      }
    })
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("deleted")) {
        Alert.alert("Successful", result.message)
      } else {
        Alert.alert("Sorry", result.message)
      }
      {this.updateFromApi()}
    })
    .catch(error => this.setState({errorMessage: "error"}));
  
  }


    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
      }

    static navigationOptions = {
      title: 'Activity',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name={Platform.OS === "ios"?"ios-basketball":"md-basketball" } size={25} color={tintColor}/>
      )
  };

    render() {
        return (
        <ScrollView> 
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
         <Text>
           <Icon name="running" size={40} color="#900" style={{ marginRight: 20 }} />
         </Text>
           <Text style={styles.header}> Exercise</Text>
         </View> 

         <Text style={styles.text}>Let's Get To Work!</Text>
             <Text style={styles.text}>Record your exercises below.</Text>
             <Text> </Text>
             <Text> </Text>
          
          <Card title="Add Exercise" containerStyle={{backgroundColor: '#E5DC9E', borderRadius: 10}} >
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 11, width: 190}}>
                Activity Time: 
              </Text>
              <DatePicker
                  date={this.state.date}
                  mode="datetime"
                  format='MMMM D, YYYY h:mm A'
                  minDate = {new Date(moment().subtract(7,'d'))}
                  maxDate={this.state.currentDate}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      borderColor: '#86878a',
                      marginLeft: 36,
                      borderRadius: 5
                    },
                    placeholderText: {
                      color: 'black'
                    }
                  }}
                  onDateChange={(date) => {this.setState({date: date})}}
              />
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 10, width: 190}}>
                Activity Name:  
              </Text>
              <TextInput 
                    ref={this.actName}
                    style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                    
                    onChangeText={(text) => {this.setState({activityname: text})}}
                  />
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 10, width: 190}}>
                Activity Duration:  
              </Text>
              <TextInput 
                    ref={this.actDuration}
                    style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                    
                    onChangeText={(text) => {this.setState({aciivityDuration: text})}}
                  />
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 10, width: 190}}>
                Activity Calories:  
              </Text>
              <TextInput 
                    ref={this.actCalories}
                    style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                    
                    onChangeText={(text) => {this.setState({activityCalorie: text})}}
                  />
            </View>
            
            <View style={{flex: 1, marginTop: -20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              

              <TouchableOpacity style={styles.touchAddButton} onPress={() => this.addActivity()}>
                  <Text style={{color: "#4d4a43", fontSize: 12, fontWeight: 'bold'}}>Add Activity</Text>             
                  
              </TouchableOpacity>      
            </View>
          </Card>
          {this.generateCard()}
      </ScrollView>
    );
  }
}



const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      },
      openButton: {
        backgroundColor: "#942a21",
        borderRadius: 20,
        padding: 10,
        elevation: 2
      },
      textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
      },
      modalText: {
        marginBottom: 15,
        textAlign: "center"
      },
      header:{
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 5
    },
    input: {
    width: 200,
    padding: 10,
    margin: 5,
    height: 40,
    borderColor: '#c9392c',
    borderWidth: 1
  },
  spaceHorizontal: {
    display: "flex",
    width: 20
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    paddingBottom: 10,
    
  },
  story: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: '100%',
    padding: 10,
    backgroundColor: 'gray'
  },
  sectionHeading: {
    margin: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#116bd1',
  },
  storyHeading: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
  },
  touchButton: {
    width: 90, 
    height: 50,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#96C85D', 
    marginLeft: 35,  
    borderRadius: 10
    },
    touchAddButton: {
      width: 100, 
      height: 50,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#96C85D', 
    marginLeft: 35,  
    borderRadius: 10
    },
    touchRemoveButton: {
      alignItems: 'center', 
      justifyContent: 'center', 
      width: 20, 
      height: 20, 
      position: 'absolute', 
      right: 0
    },
    text: {
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 20,
    }
  
});

export default ExercisesView;
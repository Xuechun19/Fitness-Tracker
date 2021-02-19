import React from 'react';
import {
  Alert,
  Platform, 
  Button, 
  Text,
  TextInput, 
  StyleSheet, 
  View, 
  TouchableWithoutFeedback, 
  Dimensions, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  ScrollView,

} from 'react-native';
import base64 from 'base-64';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  createAppContainer,
  DrawerNavigator,
  HeaderNavigationBar,
  StackNavigator,
} from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator, DrawerItems } from 'react-navigation-drawer';
// import Logactivity from './Logactivity';
import LogFood from './LogFood';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import moment from "moment";




class MealView extends React.Component {
  constructor(props) {
    super(props);
    this.actName = React.createRef();
    ////////////////////////
    // this.actCalories = React.createRef();
    // this.actCarbohydrates = React.createRef();
    // this.actProtein = React.createRef();
    // this.actFat = React.createRef();
    //////////////////////////
  
    this.state = {
      meals: {},
      accesscode: "",
      meallist: {},
      showLogFood: false,
      date: "", 
      yOffset: 0,
      foodlisttolog: [],
      mealname: "",
      changeDate: "",
      changeName: "",
      mealtimelist: {},
      totalCalorie: {}, 
      totalCarbo:  {},
      totalFat: {},
      totalProtein: {},
      changeFoodFat: -1,
      changeFoodCarbo: -1, 
      changeFoodProtein: -1,
      changeFoodCalorie: -1,
      changeFoodName: "",
      getToken: ""

    }
  }
  

  componentDidMount() {

    this.updateFromApi();
    console.log("password: "+ this.props.password)
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
          this.updateFromApi();
        });
        
   }
   
  componentWillUnmount() {
    
    this.focusListener();
  }

  updateFromApi() {
    

    fetch('https://mysqlcs639.cs.wisc.edu/login', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "x-access-token": this.props.accessToken,
        "Authorization": 'Basic ' + base64.encode(this.props.username + ":" + this.props.password)
      },
      redirect: 'follow',
    })
      .then(reponse => reponse.json())
      .then(data => {
          
        this.setState({accesscode: JSON.parse(JSON.stringify(data.token))});
        
        
        fetch('https://mysqlcs639.cs.wisc.edu/meals', {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "x-access-token": this.state.accesscode,
            "Authorization": 'Basic ' + base64.encode(this.props.username + ":" + this.props.password)
          },
          redirect: 'follow',
        })
        .then(response => response.json())
        .then(data1 => {
          
          let foodDate = {};
          let foodList = {};

          let calLog ={};
          let proLog = {};
          let fatLog = {};
          let carboLog ={};
          for (let meal of data1.meals) {
            fetch('https://mysqlcs639.cs.wisc.edu/meals/' + meal.id + '/foods', {
              method: 'GET',
              headers: {
                "Content-Type": "application/json",
                "x-access-token": this.state.accesscode,
                "Authorization": 'Basic ' + base64.encode(this.props.username + ":" + this.props.password)
              },
              redirect: 'follow',
            })
              .then(response => response.json())
              .then(data => {
                let curFood = {};
                curFood.id = meal.id;
                curFood.name = meal.name;
                curFood.date = meal.date;
                curFood.foods = data.foods;

                foodList[meal.id] = JSON.parse(JSON.stringify(curFood));
                foodDate[meal.id] = meal.date;
                
                this.setState({meallist: foodList});
                this.setState({mealtimelist: foodDate});
                let allCalories = 0;
                let allProteins = 0;
                let allFat = 0;
                let allCarbo = 0;

                for (let food of data.foods) {
                  allCalories = allCalories + food.calories;
                  allCarbo = allCarbo + food.carbohydrates;
                  allFat = allFat + food.fat;
                  allProteins = allProteins + food.protein;
                }
                calLog[meal.id] = allCalories;
                proLog[meal.id] = allProteins;
                fatLog[meal.id]= allFat;
                carboLog[meal.id] = allCarbo;

                
                this.setState({
                  totalCalorie: calLog, 
                  totalCarbo:  carboLog,
                  totalFat: fatLog,
                  totalProtein: proLog
                })

              });
              this.setState({meals: data1.meals})
          }
        })
      });
  }






  showFood(){
    if(this.props.show) {
      const screenWidth = Math.round(Dimensions.get('window').width);
      const screenHeight = Math.round(Dimensions.get('window').height);
      
      return (
        
        <View style={{position: 'absolute'}}>
          <TouchableWithoutFeedback onPress={() => this.props.hide()}>
            <View style={{width: screenWidth, height: screenHeight, top: this.props.yOffset, backgroundColor: 'black', opacity: 0.55}}>
            </View>
          </TouchableWithoutFeedback>
          <View style={{position: 'absolute', width: this.props.width, height: this.props.height, left: (screenWidth - this.props.width)/2, top: this.props.yOffset + screenHeight/8, backgroundColor: 'white', borderRadius: 10}}>
            <Text style={{fontSize: 25, marginLeft: 20, marginTop: 15}}>Add Food For Meal</Text>
            <TouchableOpacity style={styles.touchButton} onPress={() => this.props.hide()}> 
            <Text>
              <Icon name="minus-circle" size={20} color="#900" style={{ marginRight: 20 }} /></Text>
            </TouchableOpacity>
            <ScrollView style={{flex: 1}}>  
              <Card containerStyle={{backgroundColor: '#a1bbd6', borderRadius: 10}} dividerStyle={{backgroundColor: 'black'}}>
                <View  style={{marginLeft: 2, marginRight: 2, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={{ marginTop: 10, width: 60}}>
                    Name:  
                  </Text>
                  <TextInput 
                        ref={this.actName}
                        style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                        placeholder= "Enter Food Name"
                        placeholderTextColor="#6f7375"
                        onChangeText={(text) => {this.setState({foodname: text})}}
                      />
                  
                </View>
                <View  style={{marginLeft: 2, marginRight: 2, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={{ marginTop: 10, width: 75}}>
                    Calories:  
                  </Text>
                  <TextInput 
                        ref={this.actCalories}
                        style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                        placeholder= "Enter Food Calories"
                        placeholderTextColor="#6f7375"
                        onChangeText={(text) => {this.setState({foodcalories: text})}}
                      />
                  
                </View>
                <View  style={{marginLeft: 2, marginRight: 2, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
                  
                  <Text style={{marginTop: 10, width: 60}}>
                    Protein:  
                  </Text>
                  <TextInput 
                        ref={this.actProtein}
                        style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                        placeholder= "Enter Food Protein"
                        placeholderTextColor="#6f7375"
                        onChangeText={(text) => {this.setState({foodprotein: text})}}
                      />
                </View>
                <View  style={{marginLeft: 2, marginRight: 2, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
                  <Text style={{ marginTop: 10, width: 105}}>
                    Carbohydrates:  
                  </Text>
                  <TextInput 
                        ref={this.actCarbohydrates}
                        style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                        placeholder= "Enter Food Carbohydrates"
                        placeholderTextColor="#6f7375"
                        onChangeText={(text) => {this.setState({foodcarbo: text})}}
                      />
                  
                </View>
                <View  style={{marginLeft: 2, marginRight: 2, marginTop: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
                   <Text style={{marginLeft: 6, marginTop: 10, width: 35}}>
                    Fat:  
                  </Text>
                  <TextInput 
                        ref={this.actFat}
                        style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                        placeholder= "Enter Food Fat"
                        placeholderTextColor="#6f7375"
                        onChangeText={(text) => {this.setState({foodfat: text})}}
                      />
                </View>

                <View style={{flex: 1, marginTop: -20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  
          <TouchableOpacity style={styles.touchAddButton} onPress={() => this.addFood()}> 
            <Text style={{color: "#4d4a43", fontSize: 12, fontWeight: 'bold'}}>Add Food</Text>
          </TouchableOpacity>     
                </View>               
              </Card>

            </ScrollView>
          
          </View>
          
        </View>
      )
    }
    return (<View></View>)
  }
///////////////////////////////////
 
  

  changeMeal(mealID) {
    let obj = {};
    if (this.state.changeName !== "") {
      obj.name = this.state.changeName;
    }
    if (this.state.changeDate !== "") {
      obj.date = this.state.changeDate;
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", this.state.accesscode);
    myHeaders.append("Authorization", 'Basic ' + base64.encode(this.state.username + ":" + this.state.password));
    
    
    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(obj),
      redirect: 'follow', 
    };
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + mealID , requestOptions)
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("updated")) {
        Alert.alert("Successful", result.message)
      } else {
        Alert.alert("Sorry", result.message)
      }
      this.setState({changeDate: "", changeName: ""});
      this.updateFromApi();
    })
   
    
  }
  changeFoods(mealID, foodID) {
    let obj = {};
    if (this.state.changeName !== "") {
      obj.name = this.state.changeName;
    }
    if (this.state.changeFoodCalorie !== -1) {
      obj.calories = this.state.changeFoodCalorie;
    }
    if (this.state.changeFoodProtein !== -1) {
      obj.protein = this.state.changeFoodProtein;
    }
    if (this.state.changeFoodFat !== -1) {
      obj.fat = this.state.changeFoodFat;
    }
    if (this.state.changeFoodCarbo !== -1) {
      obj.carbohydrates = this.state.changeFoodCarbo;
    }


    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", this.state.accesscode);
    myHeaders.append("Authorization", 'Basic ' + base64.encode(this.state.username + ":" + this.state.password));
    
    
    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(obj),
      redirect: 'follow', 
    };
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + mealID + '/foods/' + foodID, requestOptions)
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("updated")) {
        Alert.alert("Successful", result.message)
      } else {
        Alert.alert("Sorry", result.message)
      }
      this.setState({changeDate: "", changeFoodCalorie: -1, changeFoodProtein: -1, changeFoodCarbo: -1, changeFoodFat: -1});
      this.updateFromApi();
    })
    .catch(error => this.setState({errorMessage: "error"}));
  }
  
  removeFood(mealID, foodID) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", this.state.accesscode);
    myHeaders.append("Authorization", 'Basic ' + base64.encode(this.state.username + ":" + this.state.password));

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow', 
    };
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + mealID + '/foods/' + foodID, requestOptions)
    .then(response => response.json())
    .then(result => {
      if (result.message.includes("deleted")) {
        Alert.alert("Successful", result.message);
        
      } else {
        Alert.alert("Sorry", result.message)
      }
      {this.updateFromApi()}
    })
    .catch(error => this.setState({errorMessage: "error"}));
  }
  

  generateFoodCard(mealID) {
    if (typeof this.state.meallist[mealID] !== 'undefined') {
    let foodlist = this.state.meallist[mealID].foods;
    return foodlist.map((key, index) => {
        return (
          <Card key={key.id}  containerStyle={{backgroundColor: '#A3EC76', borderRadius: 10}}>
            <View>
               <Text style ={{fontWeight: 'bold'}}>Food Id: {key.id}</Text>
               
          <TouchableOpacity style={styles.touchRemoveButton} onPress={() => this.removeFood(mealID,key.id)}> 
            <Text>
              <Icon name="minus-circle" size={20} color="#900" style={{ marginRight: 20 }} /></Text>
          </TouchableOpacity>
            </View>

            <View style={{marginLeft: 5, marginRight: 5, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
              

              <Text style={{marginTop: 5, width: 90}}>Food Name: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 125,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {key.name}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeFoodName: text})}}
              />
              
            </View>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: -10, flexDirection: 'row', flexWrap: 'wrap'}}>
              
              <Text style={{marginTop: 6, width: 30}}>Fat: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 50,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {`${key.fat}`}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeFoodFat: text})}}
              />
              <Text style={{marginTop: 5, marginLeft: 15, width: 115}}>Carbohydrates: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 50,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {`${key.carbohydrates}`}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeFoodCarbo: text})}}
              />
              
            </View>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: -10, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{marginTop: 5, width: 60}}>Protein: </Text>
              <TextInput 
                style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 50,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {`${key.protein}`}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeFoodProtein: text})}}
              />
              
              
              <Text style={{marginTop: 5, marginLeft: 25, width: 65}}>Calories: </Text>
              <TextInput 
               style={{ color: '#be03fc',fontWeight: 'bold', height: 30, width: 50, textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
               defaultValue= {`${key.calories}`}
               placeholderTextColor="#6f7375"
               onChangeText={(text) => {this.setState({changeFoodCalorie: text})}}
              />

              
            </View>
            

            <View style={{marginLeft: 5, marginRight: 5, marginTop: -8, marginBottom: -8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap'}}>
              
           
          <TouchableOpacity style={styles.touchSubmitButton} onPress={() => this.changeFoods(mealID, key.id)}> 
            <Text style={{color: "#4d4a43", fontSize: 16, fontWeight: 'bold'}}>Submit Food Changes</Text>
          </TouchableOpacity>  
            </View>

            
          </Card>
        )
    })
    }  
    }

  generateCard() {
    let meallist = this.state.meals;
    
    return Object.keys(meallist).map((keyname, index) => {
      
      let key = meallist[keyname];
      if (moment(key.date).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')) {
        return (
          
          <Card key={key.id}  containerStyle={{backgroundColor: '#E5DC9E', borderRadius: 10}}>
            <View>
               <Text style ={{fontWeight: 'bold'}}>Meal Id: {key.id}</Text>
               
          <TouchableOpacity style={styles.touchRemoveButton} onPress={() => this.removeMeal(key.id)}> 
            <Text>
              <Icon name="minus-circle" size={20} color="#900" style={{ marginRight: 20 }} /></Text>
          </TouchableOpacity>
            </View>
            <View style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
            <Text style={{marginTop: 6, width: 80}}>Meal Time: </Text>
            <DatePicker
                  style={{ marginTop: 11, width: 245}}
                  date = {typeof this.state.mealtimelist[key.id] === 'undefined' ? moment(key.date) : moment(this.state.mealtimelist[key.id])}
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
                  onDateChange={(date) => {
                    let currTime = Object.assign({}, this.state.mealtimelist);
                    currTime[key.id] = new Date(date);
                    this.setState({mealtimelist: currTime});
                    this.setState({changeDate: date})
                  }}
              />
            </View>
            <Text>   </Text>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: 8,  flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{marginTop: -15, width: 60}}>Name: </Text>
              <TextInput
                style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
                defaultValue= {key.name}
                placeholderTextColor="#6f7375"
                onChangeText={(text) => {this.setState({changeName: text})}}
              />
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, marginBottom: 8, marginTop: -13, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 10, width: 150}}>
                Calories:  {this.state.totalCalorie[key.id]}  kcal  
              </Text>
              <Text style={{ marginTop: 10, marginLeft: 10, width: 150}}>
                Protein:  {this.state.totalProtein[key.id]}  g
              </Text>
              <Text style={{ marginTop: 5, width: 150}}>
                Fat:  {this.state.totalFat[key.id]}  g  
              </Text>
              
              <Text style={{ marginTop: 5, marginLeft: 10, width: 150}}>
                Carbohydrates:  {this.state.totalCarbo[key.id]}  g  
              </Text>
              
            </View>
            <View style={{marginLeft: 5, marginRight: 5, marginTop: -15, marginBottom: -5, flexDirection: 'row', flexWrap: 'wrap'}}>
             

          <TouchableOpacity style={styles.touchFoodButton} onPress={() => this.showLogFood(key.id)}> 
            <Text style={{color: "#4d4a43", fontSize: 12, fontWeight: 'bold'}}>Add Food</Text>
          </TouchableOpacity> 

         
          <TouchableOpacity style={styles.touchSBButton} onPress={() =>  this.changeMeal(key.id)}> 
            <Text style={{color: "#4d4a43", fontSize: 12, fontWeight: 'bold'}}>Submit Changes</Text>
          </TouchableOpacity> 

            </View>
            
            <ScrollView >
              {this.generateFoodCard(key.id)}
            </ScrollView>
          </Card>
        )
      }
     })
    
  }


  addMeal() {
    let obj = {};
    obj.name = this.state.mealname;
    obj.date = this.state.date;
    this.actName.current.clear();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", this.state.accesscode);
    myHeaders.append("Authorization", 'Basic ' + base64.encode(this.state.username + ":" + this.state.password));
    
    
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(obj),
      redirect: 'follow', 
    };
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' , requestOptions)
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("created")) {
        Alert.alert("Successful", result.message)
      } else {
        Alert.alert("Sorry", result.message)
      }
      this.setState({mealname: "", date: ""});
      {this.updateFromApi()}
    })
    
  }


  removeMeal(mealID) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", this.state.accesscode);
    myHeaders.append("Authorization", 'Basic ' + base64.encode(this.state.username + ":" + this.state.password));

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow', 
    };
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + mealID, requestOptions)
    .then(response => response.json())
    .then(result => {
      this.setState({errorMessage: result.message});
      if (result.message.includes("deleted")) {
        Alert.alert("Successful", result.message);
       
      } else {
        Alert.alert("Sorry", result.message)
      }
      {this.updateFromApi()}
    })
  
  
  }


  static navigationOptions = {
    title: 'Meals',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name={Platform.OS === "ios"?"ios-pizza":"md-pizza" } size={25} color={tintColor}/>
    )
  };

  showLogFood(mealID) {
    this.setState({showmealID: mealID, showLogFood: true});
  }

  hideLogFood(){
    this.setState({showLogFood: false});
    this.updateFromApi();
  }

  

  render() {
    return (
      <ScrollView onScroll={event => { 
        this.setState({yOffset: event.nativeEvent.contentOffset.y});
        }}>
        
        
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
         <Text>
           <Icon name="pizza-slice" size={40} color="#900" style={{ marginRight: 20 }} />
         </Text>
           <Text style={styles.header}> Meals</Text>
         </View> 
          
          <Card title="Add Meal" containerStyle={{backgroundColor: '#A9E16C', borderRadius: 10}} >
      
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 11, width: 190}}>
                Meal Time: 
              </Text>
              <DatePicker
                  date={this.state.date}
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
                  onDateChange={(date) => {this.setState({date: date})}}
              />
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text style={{ marginTop: 10, width: 190}}>
                Meal Name:  
              </Text>
              <TextInput 
                    ref={this.actName}
                    style={{ color: '#be03fc',fontWeight: 'bold', height: 40, width: 150,textAlign:'center', alignItems: 'center', borderColor: '#8e8f94', borderWidth: 2, marginBottom: 15, borderRadius: 5}}
      
                    onChangeText={(text) => {this.setState({mealname: text})}}
                  />
            </View>
           
            <View style={{flex: 1, marginTop: -20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
       
        
          <TouchableOpacity style={styles.touchAMButton} onPress={() => this.addMeal()}> 
            <Text style={{color: "#4d4a43", fontSize: 12, fontWeight: 'bold'}}>Add Meal</Text>
          </TouchableOpacity>
            
            </View>
          </Card>
          
           {this.generateCard()}
          <LogFood 
            width={350} 
            password={this.props.password}
            mealID={this.state.showmealID}
            accesscode={this.state.accesscode}
            accessToken={this.props.accessToken} 
            foodlist={this.state.foodlisttolog} 
            height={400} 
            yOffset={this.state.yOffset} 
            show={this.state.showLogFood} 
            hide={() => this.hideLogFood()} 
            
          />
         
      </ScrollView>
    );
  }


} 
const styles = StyleSheet.create({
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
    touchRemoveButton: {
      alignItems: 'center', 
      justifyContent: 'center', 
      width: 20, 
      height: 20, 
      position: 'absolute', 
      right: 0
    },
    touchSubmitButton: {
      height: 30, 
      display: 'flex', 
      
      fontSize: 15, 
      alignItems: 'center', 
      justifyContent: 'center' ,
      backgroundColor: '#ECBF76',  
      borderRadius: 10
    },
    touchFoodButton: {
      flex: 1, 
      height: 40, 
      
      fontSize: 10, 
      alignItems: 'center', 
      backgroundColor: '#ECBF76', 
      marginTop: 14, 
      justifyContent: 'center', 
      borderRadius: 10
    },
    touchSBButton: {
      marginLeft: 10, 
      flex: 1, 
      height: 40, 
       
      fontSize: 10, 
      alignItems: 'center', 
      backgroundColor: '#ECBF76', 
      marginTop: 14, 
      justifyContent: 'center', 
      borderRadius: 10
    },
    header:{
      fontSize: 32,
    fontWeight: "700",
    marginBottom: 5
  },
    touchTimeButton: {
      flex: 1, 
      height: 40, 
       
      fontSize: 10, 
      alignItems: 'center', 
      backgroundColor: '#e0ac5e', 
      marginTop: 14, 
      justifyContent: 'center', 
      borderRadius: 10
    },
    touchAMButton: {
      height: 30, 
      display: 'flex', 
      
      fontSize: 15,     
      
      alignItems: 'center', 
      backgroundColor: '#ECBF76', 
      marginTop: 14, 
      marginLeft: 10, 
      justifyContent: 'center', 
      borderRadius: 10
    }
  });
export default MealView;
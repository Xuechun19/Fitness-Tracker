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
  ScrollView, DatePickerAndroid,
  TimePickerAndroid,
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
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import moment from "moment";

class TodayView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      userData: {},
      activity: [],
      totalExerciseDuration: 0,
      totalWorkCalorie: "",
      totalCalorie: "",
      accesscode: "",
      showProfile: false,
      totalCalorie: 0, 
      totalCarbo:  0,
      totalFat: 0,
      totalProtein: 0,
      meallist: {},
      mealtimelist: {},
      meals: {},
      curDate: moment().startOf('day'),
      texttodisplay: "Current Day Summary",
      leftArrow: 'tomato',
      rightArrow: 'gray',
      mealID: 0,
    }
  }
  

  componentDidMount() {
    
    this.updateFromApi(); // Function that updates component from fetch
    // Subscribe that same function to focus events on the component in the future
    this._navListener = this.props.navigation.addListener('focus', () => {
       this.updateFromApi();
    });
   }
   
  componentWillUnmount() {
    // Remove the event listener
    this._navListener();
  }


  async updateFromApi() {
   
    let exerciseDuration = 0;
    let totalCal = 0;
    
    let curCalories = 0;
    let curCarbo = 0;
    let curFat = 0;
    let curProteins = 0;
    
    await fetch('https://mysqlcs639.cs.wisc.edu/users/' + this.props.username, 
    {
      method: 'GET',
      headers: {"Content-Type": "application/json",
                "x-access-token": this.props.accessToken},
      redirect: 'follow',

    })
      .then(response => response.json())
      .then(data => {
        this.setState({userData: data});
      })
      .then(fetch('https://mysqlcs639.cs.wisc.edu/activities', 
      {
        method: 'GET',
        headers: {"Content-Type": "application/json",
                  "x-access-token": this.props.accessToken},
        redirect: 'follow',
  
      })
        .then(response => response.json())
        .then(data => {
          this.setState({activity: data.activities});
          
          for (let eachAct of this.state.activity) {
            if (moment(eachAct.date).format('DD-MM-YYYY') === moment(this.state.curDate).format('DD-MM-YYYY')) {
              exerciseDuration = exerciseDuration + eachAct.duration;
              totalCal = totalCal + eachAct.calories;
            }
            
          }
          this.setState({totalExerciseDuration: exerciseDuration, 

                         totalWorkCalorie: totalCal});

          fetch('https://mysqlcs639.cs.wisc.edu/meals', 
          {
            method: 'GET',
            headers: {"Content-Type": "application/json",
                      "x-access-token": this.props.accessToken},
            redirect: 'follow',
      
          })
            .then(response => response.json())
            .then(data1 => {
            
            for (let i = 0 ; i < data1.meals.length; i++) {
                let meal = data1.meals[i];
                if (moment(meal.date).format('DD-MM-YYYY') === moment(this.state.curDate).format('DD-MM-YYYY')) {
                    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + meal.id + '/foods', {
                      method: 'GET',
                      headers: {"Content-Type": "application/json",
                                "x-access-token": this.props.accessToken},
                      redirect: 'follow',
                
                    })
                    .then(response => response.json())
                    .then(data => {
                        let foodDate = {};
                        let foodInfo = {};
                        let todayfood = {};

                        todayfood.id = meal.id;
                        todayfood.name = meal.name;
                        todayfood.date = meal.date;
                        todayfood.foods = data.foods;

                        foodInfo[meal.id] = JSON.parse(JSON.stringify(todayfood));
                        foodDate[meal.id] = meal.date;

                        this.setState({meallist: foodInfo});
                        this.setState({mealtimelist: foodDate});


                        for (let food of data.foods) {
                            
                            curCalories = curCalories + JSON.parse(JSON.stringify(food.calories));
                            curCarbo = curCarbo + food.carbohydrates;
                            curFat = curFat + food.fat;
                            curProteins = curProteins + food.protein;
                        }
                             
                        
                        this.setState({
                            totalCalorie: curCalories, 
                            totalCarbo:  curCarbo,
                            totalFat: curFat,
                            totalProtein: curProteins
                        })
                    })
                }             
            this.setState({meals: data1.meals})
            }
        })    
        })      
      )    
  }


  
  static navigationOptions = {
      title: 'Current Day',
      tabBarIcon: ({ tintColor }) => (
        <Ionicons name={Platform.OS === "ios"?"ios-calendar":"md-calendar" } size={25} color={tintColor}/>
      )
  };


generateExerCard() {
 
  let activitylist = this.state.activity;
  return activitylist.map((key, index) => {
    if (moment(key.date).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')) {
      
      return (
        
        <Card key={key.id}  containerStyle={{backgroundColor: '#E59EA8', borderRadius: 10}}>
          <View>
             <Text style ={{fontWeight: 'bold'}}>Activity Id: {key.id}</Text>
             
          </View>
          <View style={{marginLeft: 5,alignItems: 'center', justifyContent: 'center', marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
          
          
          </View>
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
            
          </View>
        </Card>       
        
      )
    }
  })
}


generateMealCard() {
  let meallist = this.state.meals;
  
  return Object.keys(meallist).map((keyname, index) => {
    
    let key = meallist[keyname];
    console.log("key.id in meal: "+ key.id)
    
    if (moment(key.date).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')) {
      // this.setState({mealID: key.id})
      console.log("mealID in meal: "+ this.state.mealID)
      return (
        
        <Card key={key.id}  containerStyle={{backgroundColor: '#edb879', borderRadius: 10}}>
          <View>
             <Text style ={{fontWeight: 'bold'} }>Meal Id: {key.id}</Text>
             
        <TouchableOpacity style={styles.touchRemoveButton} onPress={() => this.removeMeal(key.id)}> 
          <Text>
            <Icon name="minus-circle" size={20} color="#900" style={{ marginRight: 20 }} /></Text>
        </TouchableOpacity>
          </View>
         
          <Text>  </Text>
          <View style={{marginLeft: 5, marginRight: 5, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap'}}>
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
           
          </View>
          
          <ScrollView >
           
          </ScrollView>
        </Card>
        
      )
    }   
   })
  
}

getMealID(){
  let meallist = this.state.meals;
  
   Object.keys(meallist).map((keyname, index) => {
    let key = meallist[keyname];
    this.setState({mealID: key.id})
  }
  )
  console.log("mealID in getMealID: " + this.state.mealID)
  return this.state.mealID;

}

generateFoodCard(mealID) {
  console.log("mealId in food func: "+ this.state.mealID);

  if (typeof this.state.meallist[mealID] !== 'undefined') {
  let foodlist = this.state.meallist[mealID].foods;
  return foodlist.map((key, index) => {
      return (
        <Card key={key.id}  containerStyle={{backgroundColor: '#edb879', borderRadius: 10}}>
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
          <Text style={{color: "#0a0a0a", fontSize: 16, fontWeight: 'bold'}}>Submit Food Changes</Text>
        </TouchableOpacity>  
          </View>

          
        </Card>
      )
  })
  }  
  }


  
    
  render() {
    return (
        <ScrollView style={styles.container}>

          {/* <View style={styles.container}></View> */}

         <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
         <Text>
           <Icon name="spa" size={40} color="#900" style={{ marginRight: 20 }} />
         </Text>
           <Text style={styles.header}> Today</Text>
         </View>
             <Text style={styles.text}>What's on the agenda for today?</Text>
             <Text style={styles.text}>Below are all of your goals and exercises.</Text>
             <Text> </Text>
             <Text> </Text>
            
          {/* <Text  style={[styles.sectionHeading, {marginLeft: 15, marginRight: 15}]} >{this.state.texttodisplay}</Text>            */}
          <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Card title="Today's Activity" containerStyle={{backgroundColor: '#E5DC9E', borderRadius: 10}} >
          <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Calories Burned:   
              </Text>
              <Text>
                {this.state.totalWorkCalorie} kcal
              </Text>
            </View>

            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Duration:  
              </Text>
              <Text>
                {this.state.totalExerciseDuration} min
              </Text>
            </View>
            
          </Card>

          <Card title="Today's Nutrition" containerStyle={{backgroundColor: '#E5DC9E', borderRadius: 10}} >
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Calories: 
              </Text>
              <Text>
                {this.state.totalCalorie}  kcal
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Protein:  
              </Text>
              <Text>
                {this.state.totalProtein}  g
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text>
                Carbohydrates:  
              </Text>
              <Text>
                {this.state.totalCarbo}  g
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text>
                Fat:  
              </Text>
              <Text>
                {this.state.totalFat}  g
              </Text>
            </View>
          </Card>

          <Card title="Your Goals" containerStyle={{backgroundColor: '#E5DC9E', borderRadius: 10}} >
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Activity:  
              </Text>
              <Text>
                {this.state.userData.goalDailyActivity} min
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Calories: 
              </Text>
              <Text>
                {this.state.userData.goalDailyCalories} kcal
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Protein:  
              </Text>
              <Text>
                {this.state.userData.goalDailyProtein} g
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Carbohydrates:  
              </Text>
              <Text>
                {this.state.userData.goalDailyCarbohydrates} g
              </Text>
            </View>
            <View  style={{marginLeft: 5, marginRight: 5, flexDirection: 'row', flexWrap: 'wrap'}}>
              <Text >
                Fat:  
              </Text>
              <Text>
                {this.state.userData.goalDailyFat} g
              </Text>
            </View>

          </Card>
          </View>
          {this.generateExerCard()}
          {this.generateMealCard()}
          
          {/* {this.generateFoodCard(this.getMealID())} */}
          
          
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    paddingBottom: 10,
    
  },
  header:{
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 5
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
  text: {
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 20,
  },
  touchRemoveButton:{
    alignItems: 'center', 
      justifyContent: 'center', 
      width: 20, 
      height: 20, 
      position: 'absolute', 
      right: 0
  }
});


export default TodayView;

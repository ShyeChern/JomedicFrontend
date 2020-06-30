import React from 'react'
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'

const App = () => {
   return (
      <View style = {styles.container}>
         <TouchableOpacity o
         onPress={() => alert('Your account is ACTIVATED')}>
            <Text style = {styles.text}>
               Activate
            </Text>
         </TouchableOpacity>
      </View>
   )
}
export default App

const styles = StyleSheet.create ({
   container: {
       paddingTop: 250,
       paddingLeft: 40,
       paddingRight: 40,
       
      
   },
   text: {
       borderWidth: 1,
       padding : 20,
       backgroundColor:'#F5A623', 
       textAlign: 'center',
       justifyContent: 'center',
       

      
   }
})
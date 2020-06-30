
import React, { Component } from 'react';
import {StyleSheet,Text,View,TextInput,TouchableOpacity,} from 'react-native';

export default class pinReload extends Component {
   
    constructor(props) {
        super(props)

        this.state = {
        
           
            reloadPinvalue:'',
            status: '',
            
        }
    }
  
    componentDidMount() {
      const datas = {
        txn_cd: 'MEDEWALL04',
        tstamp: new Date(),
        data: {
          userID: 'syazreenshuayli@gmail.com'
        }
      }
  
      fetch(URL + '/EWALL', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datas)
  
      }).then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson)
          this.setState({
            reloadPinvalue: responseJson.status.pin_number,
            status: responseJson.status.status,
          })
  
        }).catch((error) => {
          alert(error)
        });
    }
  
    updateProfile() {
      this.props.navigation.navigate("Balance");
    }
  

  render() {
    return (
      <View style={styles.container}>
        <View style = {{ padding: 40,}}> 
      
         <TextInput
                    value={this.state.value}
                    onChangeText={(reloadPinvalue) => this.setState({ reloadPinvalue })}
                    placeholder={' Enter Reload Pin'}
                     style={styles.input}
                 />
        
          
          </View>
          <View style={{ padding: 70 }}>
          <TouchableOpacity onPress={() => this.updateProfile()} style={{ padding: 10, textAlign: 'center', backgroundColor: '#F5A623', borderRadius: 24 }}>
            <Text style={{ textAlign: 'center' }}> Reload </Text>
          </TouchableOpacity>
        </View>
          
                 
           
          
         
          
        </View>
    );
  }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: 'white',
 
     },
 
    
  
});
 
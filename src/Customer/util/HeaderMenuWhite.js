import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

export default class HeaderMenuBlack extends Component {
    headerMenu = null;

    setMenuRef = ref => {
        this.headerMenu = ref;
    };

    showMenu = () => {
        this.headerMenu.show();
    };

    hideMenu = () => {
        this.headerMenu.hide();
    };

    option1Click = () => {
        this.props.navigation.navigate('Doctor');
        // this.headerMenu.hide();
        // action here
    };

    option2Click = () => {
        this.headerMenu.hide();
    };

    option4Click = () => {
        this.headerMenu.hide();
    };

    render() {
        return (
            <View>
                <Menu
                    ref={this.setMenuRef}
                    button={
                        <TouchableOpacity style={{ marginHorizontal: 10 }}
                            onPress={this.showMenu}>
                            <SimpleLineIcons name='options-vertical' size={25} color='#FFFFFF' />
                        </TouchableOpacity>
                    }
                >
                    {/* <MenuItem onPress={this.option1Click}>Option 1</MenuItem>

                    <MenuDivider />
                    <MenuItem onPress={this.option2Click}>Option 2</MenuItem>

                    <MenuDivider />

                    <MenuItem onPress={this.option4Click}>op4</MenuItem> */}
                </Menu>
            </View>
        );
    }
}

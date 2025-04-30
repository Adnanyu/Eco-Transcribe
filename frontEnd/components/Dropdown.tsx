import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DropdownMenu } from './DropdownMenu';
import { MenuOption } from './MenuTrigger';
import { IconSymbol } from './ui/IconSymbol';
import { Recording } from '@/app/types/types';
import { createTranscript } from '@/app/api/api';
import { useRouter } from 'expo-router';

type DropdownMenu = {
    label: string,
    action: () => void,
    icon: string
  };
// TODO: change the menues type and create a type for it later
const DropDown = ({ menus }:{ menus: DropdownMenu[]}) => {
    const [visible, setVisible] = useState(false);
    const router = useRouter();
    // console.log("transcript is", recording?.transcript)

    const handlePress = (action: () => void) => {
        setVisible(false);
        action()
    }

  return (
    <View style={styles.container}>
      <DropdownMenu
        visible={visible}
        handleOpen={() => setVisible(true)}
        handleClose={() => setVisible(false)}
        trigger={
          <View style={styles.triggerStyle}>
            <IconSymbol size={20} name={'ellipsis'} color={'white'} />
          </View>
        }
          >
              {
                  menus.map((item) => (
                      <TouchableOpacity onPress={() => handlePress(item.action)} >
                          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', paddingVertical: 2}}>
                              <Text style={{ color: 'white', padding: 5 }}>{item.label}</Text>
                              <IconSymbol size={25} name={item.icon}  color={'white'} />
                          </View>
                      </TouchableOpacity>
                  ))
                //   Object.entries(menus).map(([label, action]) => (
                //     <TouchableOpacity key={label} onPress={action} style={styles.menuItem}>
                //       <Text>{label}</Text>
                //     </TouchableOpacity>
                //   ))
        }
              {/* // style={{ borderBottomColor: 'gray', borderBottomWidth: 1}} */}
        {/* <TouchableOpacity onPress={() => { setVisible(false); }} > 
          <Text style={{color: 'white', padding: 5}}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setVisible(false); }} style={{}}>
          <Text style={{color: 'white', padding: 5}}>Delete</Text>
        </TouchableOpacity> */}
              {/* {recording?.transcript ?
                  (<>
                        <TouchableOpacity onPress={() => { setVisible(false); router.push(`/transcripts/${recording.id}`)}} style={{}}>
                                <Text style={{color: 'white', padding: 5}}>View Transcript</Text>
                        </TouchableOpacity>
                  </>)
                      :
                  (
                      <> 
                        <TouchableOpacity onPress={async () => { setVisible(false); await createTranscript(recording)}} style={{}}>
                                <Text style={{color: 'white', padding: 5}}>Create a Transcript</Text>
                        </TouchableOpacity>
                      </>
                  ) 
        
        } */}
      </DropdownMenu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerStyle: {
    // height: 40,
      backgroundColor: 'rgba(40, 40, 40, 0.9)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      borderRadius: 50,
  }
});

export default DropDown;
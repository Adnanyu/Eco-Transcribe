import { View, Text, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const Spinner = ({isLoading, text}: {isLoading: boolean, text: string}) => {

  return (
      <Modal style={{ justifyContent: 'center' }} transparent={true} animationType="fade" visible={isLoading}>
          <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
            <View style={styles.overlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{ color: 'white', paddingTop: 5 }}>{text}</Text>
            </View>
          </View>
        </Modal>
      )
};

const styles = StyleSheet.create({
    overlay: {
    height: 250,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 41, 41, 1)', 
    alignSelf: 'center',
    marginVertical: 'auto',
    borderRadius: 15,
  },
});

export default Spinner;

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RootState } from "@/store/store";
import { useRouter } from "expo-router";
import { SafeAreaView, View, Text, TextInput, StyleSheet, FlatList, Pressable } from "react-native";
import { useSelector } from "react-redux";

export default function User() {

  const {recordings} = useSelector((state: RootState) => state.recordings)
  const { transcripts } = useSelector((state: RootState) => state.transcripts)

  const router = useRouter();

  const tabs = [{
    title: 'Recordings',
    icon: <IconSymbol size={25} name={"waveform"}  color={'#FA2E47'} />,
    count: recordings.length,
    action: () => { router.navigate('/(tabs)/recordings'); }
  },
  {
    title: 'Transcripts',
    icon: <IconSymbol size={25} name={"text.page"}  color={'#FA2E47'} />,
    count: transcripts.length,
    action: () => {  }
    },
    {
      title: 'Translated Transcripts',
      icon: <IconSymbol size={25} name={"questionmark.text.page"}  color={'#FA2E47'} />,
      count: 0,
      action: () => {  }
    },
    {
      title: 'Summaries',
      icon: <IconSymbol size={25} name={"text.redaction"}  color={'#FA2E47'} />,
      count: 0,
      action: () => {  }
    },
  ]
    return (
      <SafeAreaView>
        <View style={styles.TitleInput}>
          <IconSymbol  size={20} name={"magnifyingglass"}  color={'#FA2E47'} />
          <TextInput style={{paddingLeft: 10, color: 'white'}} placeholder="Search" onChangeText={(value) => {}} />
        </View>
        <View style={{paddingHorizontal: 10, backgroundColor: '#1c1c1f', marginTop: 9, borderRadius: 15, marginHorizontal: 12}}>
          {/* {tabs.map(tab => (
            <View key={tab.title} style={styles.tabsContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {tab.icon}
                <Text style={{ color: 'white', fontSize: 20, marginLeft: 9}}>{tab.title}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{ color: 'gray' , fontSize: 20, marginRight: 7}}>{tab.count}</Text>
                <IconSymbol size={17} name={"chevron.right"}  color={'#FA2E47'} />
              </View>
            </View>
          ))} */}
          <FlatList
            data={tabs}
            keyExtractor={(tab) => tab.title}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable onPress={item.action}>
                <View key={item.title} style={styles.tabsContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {item.icon}
                    <Text style={{ color: 'white', fontSize: 20, marginLeft: 9}}>{item.title}</Text>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{ color: 'gray' , fontSize: 20, marginRight: 7, paddingVertical: 5}}>{item.count}</Text>
                    <IconSymbol size={17} name={"chevron.right"}  color={'#FA2E47'} />
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 7,
    margin: 2,
    // borderColor: 'white',
    // borderWidth: 1,
    // borderRadius: 9
  },
  TitleInput: {
     flexDirection: 'row',
      backgroundColor: '#1c1c1f',
      marginHorizontal: 'auto',
      width: '94%',
      borderWidth: 1,
      borderRadius: 10,
      padding: 8,
  },
  separator: {
    height: 0.3,
    backgroundColor: '#8E8E93',
    marginLeft: 40, // Optional: adds spacing on the sides
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconRight: {
    position: 'absolute',
    left: 9,
    top: 12,
  }
})
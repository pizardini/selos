import { StatusBar } from 'expo-status-bar';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function addSelo2() {

  const [imagem, setImagem] = useState(null);

  const chooseImage = async () => {
    let escolha = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      allowsMultipleSelection: false,
      aspect: [16, 9],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!escolha.canceled) {
      setImagem(escolha.assets[0].uri);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Exemplo de escolha de imagem</Text>
        <Button title='Escolher imagem' onPress={chooseImage} />
        <Button title='Apagar imagem' onPress={()=>{setImagem(null)}}/>
        <View style={styles.imagemContainer}>
          {imagem === null ? null : <Image style={styles.imagem} source={imagem} />}
        </View>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagem: {
    marginTop: 20,
    width: 320,
    height: 180,
  }
});
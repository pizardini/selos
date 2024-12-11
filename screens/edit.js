import { ActivityIndicator, Button, Keyboard, SafeAreaView, Text, TextInput, View } from "react-native";
import { globalStyles } from "../estilos";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import Toast from 'react-native-toast-message';
import { schema, estilosAdd } from "./add";
import { useState, useEffect } from "react";
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function EditScreen ({navigation, route}) {
    const db = useSQLiteContext();
    const [busy, setBusy] = useState(false);
    const [imagem, setImagem] = useState(null);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            nome: '',   
            quantidade: '',
            foto: '',
        },
        // resolver: yupResolver(schema)
    });

    useEffect(()=>{
        Carregar();
    },[route])

    const Carregar = async () => {
        reset({name: '', quantidade: '', foto: ''});
        setImagem(null);
        setBusy(true);
    
        if(route.params?.id !== null){
            try {
                const query = 'SELECT * FROM selo WHERE id = ?';
                const resultado = await db.getFirstAsync(query, [ route.params?.id])

                if (resultado) {
                    reset({
                        id: resultado.id,
                        nome: resultado.nome,
                        quantidade: resultado.quantidade,
                        foto: resultado.foto
                    });
                    setImagem(resultado.foto);
                } else {
                    throw new Error('Selo não encontrado');
                }
            } catch(error) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro',
                    text2: 'Houve um erro ao buscar o selo informado',
                    position: 'bottom'
                });
                navigation.goBack();
            }
        } else {
            navigation.goBack();
        }
    
        setBusy(p=>false);
    };
    
    const chooseImage = async () => {
        let escolha = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          allowsMultipleSelection: false,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1
        });
      
        if (!escolha.canceled) {
            Keyboard.dismiss();
            const imagemUri = escolha.assets[0].uri;
            const base64Image = await fetch(imagemUri)
              .then((response) => response.blob())
              .then((blob) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              }));
        
            setImagem(base64Image);
          }
      }

    const updateSelo = async(data) => {
        const { nome, quantidade, foto: imagem } = data;
        id = route.params?.id;
        try {
            const resultado = await db.runAsync('UPDATE selo SET nome = $nome, quantidade = $quantidade, foto = $foto WHERE id = $id', { $id: id, $nome: nome, $quantidade: quantidade, $foto: imagem });

            console.log(resultado);

            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Selo atualizado com sucesso!',
                position: 'center',
            });
            navigation.navigate("list", { atualizar: true });
        } catch (error) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível atualizar o selo',
                position: 'center',
            });
        }
    }

    const onSubmit = async(data) => {
        setBusy(true);
        updateSelo(data);
    
        setBusy(p => false);
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={{fontSize: 30}}>Edição de selos</Text>
            <View>
                <Controller control={control}
                    render={({ field: { onChange, value } }) => (
                        <TextInput placeholder="Nome" keyboardType="default" onChangeText={onChange} value={value} style={estilosAdd.input} />
                    )}
                    name="nome" />
                {errors.nome && <Text style={estilosAdd.error}>{errors.nome.message}</Text>}
            </View>

            <View>
                <Controller control={control}
                    render={({ field: { onChange, value } }) => (
                        <TextInput placeholder="quantidade" keyboardType="phone-pad" onChangeText={onChange} value={value} style={estilosAdd.input} />
                    )}
                    name="quantidade" />
                {errors.phone && <Text style={estilosAdd.error}>{errors.quantidade.message}</Text>}
            </View>
            <View>
                <Button title="Escolher imagem" onPress={chooseImage} />
                <View style={estilosAdd.imagemContainer}>
                    {imagem ? (
                        <Image 
                            style={estilosAdd.imagem} 
                            source={{ uri: imagem.startsWith("data:image") ? imagem : `data:image/png;base64,${imagem}` }} 
                        />
                    ) : (
                        <Text>Nenhuma imagem selecionada</Text>
                    )}
                    <Button title="Apagar imagem" onPress={() => setImagem(null)} />
                </View>
            </View>
            <ActivityIndicator size="large" animating={busy} />
            <Button onPress={handleSubmit(onSubmit)} disabled={busy} title="Salvar" />

        </SafeAreaView>
    )
}
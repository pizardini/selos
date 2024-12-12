import { SafeAreaView, Text, View } from "react-native";
import { globalStyles } from "../estilos";
import Toast from 'react-native-toast-message';
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "react-native";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Keyboard } from "react-native";
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';

export const schema = yup.object({
    nome: yup.string().required('Por favor, informe um nome.'),
    quantidade: yup.string().required('Por favor, informe uma quantidade.'),
}).required();

export default function AddScreen({ navigation }) {

    const [imagem, setImagem] = useState(null);
    const db = useSQLiteContext();
    const [busy, setBusy] = useState(false);
    const { control, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            nome: '',
            quantidade: '',
            foto: ''
        },
        resolver: yupResolver(schema)
    });

    const [permission, requestPermission] = useCameraPermissions();
    const [camera, setCamera] = useState('front');
    const [fotourl, setFotoURL] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);

    const handleCamera = () => {
        setCamera(camera === 'front' ? 'back' : 'front');
    };

    const handlePicture = async () => {
        if (this.camera) {
            const picture = await this.camera.takePictureAsync({
                imageType: 'png',
                quality: 1
            });
            setFotoURL(picture.uri);
            setCameraVisible(false);
        }
    };

    const updateTotal = async () => {
        const resultado = await db.getFirstAsync('select count(id) as total from selo');
        setTotal(resultado.total);
    };

    const addSelo = async (data) => {
        const { nome, quantidade, foto: imagem } = data;
        try {
            const resultado = await db.runAsync('insert into selo (nome, quantidade, foto) values ($nome, $quantidade, $foto)', { $nome: nome, $quantidade: quantidade, $foto: imagem });
            if (resultado.changes === 1) {
                navigation.navigate("list", { atualizar: true });
                updateTotal();
            }
            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Selo cadastrado com sucesso!',
                position: 'center',
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível cadastrar o selo',
                position: 'center',
            });
        }
    };

    useEffect(() => {
        if (imagem) {
            setValue('foto', imagem);
        }
    }, [imagem]);

    const onSubmit = async (data) => {
        Keyboard.dismiss();
        setBusy(true);
        await addSelo(data);
        setBusy(false);
    };

    const chooseImage = async () => {
        let escolha = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            allowsMultipleSelection: false,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0
        });

        if (!escolha.canceled) {
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
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={{ fontSize: 30 }}>Nova entrada</Text>
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
                        <TextInput placeholder="Quantidade" keyboardType="phone-pad" onChangeText={onChange} value={value} style={estilosAdd.input} />
                    )}
                    name="quantidade" />
                {errors.quantidade && <Text style={estilosAdd.error}>{errors.quantidade.message}</Text>}
            </View>

            <View style={estilosAdd.rowContainer}>
                <Button title='Escolher imagem' onPress={chooseImage} />
                <Button title='Abrir Câmera' onPress={async () => {
                    const perm = await requestPermission();
                    if (perm.granted) {
                        setCameraVisible(true);
                    }
                }} />
            </View>

            {cameraVisible && (
                <>
                    <CameraView style={{ width: 200, height: 200 }} facing={camera} ref={(ref) => { this.camera = ref }} />
                    <View style={estilosAdd.rowContainer}>
                        <Button title='Tirar foto' onPress={handlePicture} />
                        <Button title='Alternar câmera' onPress={handleCamera} />
                    </View>
                </>
            )}

            {fotourl !== '' && !cameraVisible && (
                <Image style={{ width: 200, height: 200 }} source={{ uri: fotourl }} />
            )}
            <Image style={estilosAdd.imagem} source={imagem} transition={1000} contentFit="contain"/>
            <ActivityIndicator size="large" animating={busy} />
            <Button onPress={handleSubmit(onSubmit)} disabled={busy} title="Salvar" />
        </SafeAreaView>
    );
}

export const estilosAdd = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        width: 320,
        padding: 10,
        fontSize: 30
    },
    error: {
        color: "crimson",
        fontSize: 24
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20
    },
    imagemContainer: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imagem: {
        marginTop: 20,
        width: 156,
        height: 189
    }
});
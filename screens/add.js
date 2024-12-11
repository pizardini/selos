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

export const schema = yup.object({
    nome: yup.string().required('Por favor, informe um nome.'),
    quantidade: yup.string().required('Por favor, informe um telefone.'),
}).required();

export default function AddScreen({navigation}) {

    const db = useSQLiteContext();

    const [busy, setBusy] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            nome: '',
            quantidade: '',
            foto: ''
        },
        resolver: yupResolver(schema)
    });

    // const updateTotal = async () => {
    //     const resultado = await db.getFirstAsync('select count(id) as total from selo');
    //     setTotal(resultado.total);
    // }

    const addSelo = async (data) => {
        const { nome, quantidade, foto } = data;
        const resultado = await db.runAsync('insert into selo (nome, quantidade, foto) values ($nome, $quantidade, $foto)', { $nome: nome, $quantidade: quantidade, $foto: foto });
        console.log(resultado);
        if (resultado.changes === 1) {
            console.log(resultado.changes)
            console.log('Selo salvo com sucesso');
            updateTotal();
        }
    }

    // useEffect(() => {
    //     updateTotal();
    // }, []);

    const onSubmit = async (data) => {
        Keyboard.dismiss();
        setBusy(true);
        await addSelo(data);
        setBusy(false);
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <Text style={{fontSize: 30}}>Nova entrada</Text>
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
                <Controller control={control}
                    render={({ field: { onChange, value } }) => (
                        <TextInput placeholder="foto" keyboardType="default" onChangeText={onChange} value={value} style={estilosAdd.input} />
                    )}
                    name="foto" />
                {errors.phone && <Text style={estilosAdd.error}>{errors.foto.message}</Text>}
            </View>

            <ActivityIndicator size="large" animating={busy} />
            <Button onPress={handleSubmit(onSubmit)} disabled={busy} title="Salvar" />

        </SafeAreaView>
    )
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
    }
})
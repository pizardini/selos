import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, StyleSheet, Text, View } from "react-native";
import { globalStyles } from "../estilos";
import { ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Pressable } from "react-native";
import { RefreshControl } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { useContext } from "react";


import { Button } from "react-native";

const ListContext = createContext(null);

export default function ListScreen({navigation, route}) {
    const db = useSQLiteContext();
    const [busy, setBusy] = useState(false);
    const [update, setUpdate] = useState(true);
    const [data, setData] = useState(null);

    const atualizarLista = async () => {
        setBusy(p => true);
        const resultado = await db.getAllAsync('select id, nome, quantidade, foto from selo order by nome');
        setData(resultado);
        setBusy(p => false);
    }

    useEffect(() => {
        if (update || route.params?.atualizar) {
            atualizarLista();
            setUpdate(false);
        }
    }, [update, route]);

    // console.log(db);

    return (
        <SafeAreaView style={globalStyles.container}>

            <Button title="Novo" onPress={()=>{navigation.navigate("add")}}/>

            <ListContext.Provider value={{setBusy: setBusy, atualizarLista: atualizarLista, navigation, db}}>
            <View style={localStyles.topo}>
                <Text style={{ textAlign: "center", fontSize: 24 }}>Todos os seus selos estão aqui</Text>
                <View>
                    <SwipeListView
                        data={data}
                        renderItem={ItemLista}
                        renderHiddenItem={BackitemLista}
                        leftOpenValue={80}
                        rightOpenValue={-72}
                        keyExtractor={item => item.id}
                        style={{ height: "100%" }}
                        refreshControl={
                            <RefreshControl refreshing={busy} onRefresh={() => { atualizarLista(true) }} />
                        }
                    />
                </View>
            </View>
            </ListContext.Provider>
        </SafeAreaView>
    )
}

const ItemLista = (data, rowMap) => {
    // console.log(data)
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable style={({ pressed }) => [
                {
                    backgroundColor: pressed ? "#fff" : "#fff",
                },
                localStyles.itemDestaque,
            ]}
                onPress={() => { closeRow(rowMap, data.item.id) }}
            >
                <View style={{ width: "100%" }}>
                    <Text style={{ textAlign: "center", fontSize: 24 }}>{data.item.nome}</Text>
                </View>
            </Pressable>
        </View>
    )
}

const BackitemLista = (data, rowMap) => (
    <View style={localStyles.itemFundo}>
        <DelButton data={data} rowMap={rowMap}/>
        <EditButton data={data}/>
    </View>
);

const DelButton = ({ data, rowMap }) => {
    const db = useSQLiteContext();
    const context = useContext(ListContext);
    return (
        <Button title="Excluir" status={{ left: 0 }} color="crimson" onPress={() => {
            Alert.alert(
                'Excluir entrada',
                'Deseja realmente excluir esta entrada?',
                [
                    {
                        text: "Não", style: 'cancel',
                        onPress: () => { }
                    },
                    {
                        text: 'Sim', style: 'destructive',
                        onPress: async () => {
                            context.setBusy(true);
                            try { 
                                await db.runAsync('DELETE FROM selo WHERE id = $id', { $id: data.item.id })
                                Toast.show({
                                    type: 'success',
                                    text1: 'Sucesso',
                                    text2: 'Selo excluído com sucesso!',
                                    position: 'center',
                                });
                            }
                                
                            catch(e) {
                                console.log(e)
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erro',
                                    text2: 'Não foi possível excluir o selo',
                                    position: 'center',
                                });
                            }
                            context.atualizarLista();
                            context.setBusy(false);
                        },
                    },
                ]
            );
        }} />
    )
}

const EditButton = ({data}) => {

    const context = useContext(ListContext);

    const carregar = () => {
        context.navigation.navigate('edit', {id: data.item.id});
      }
      return(
          <Button title="Editar" style={{ right: 0 }} color="steelblue" id={data.item.id} onPress={carregar}/>
      )
    }

const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
        rowMap[rowKey].closeRow();
    }
};

const localStyles = StyleSheet.create({
    topo: {
        marginTop: 10,
        width: "100%"
    },
    itemDestaque: {
        alignItems: 'flex-start',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 60,
        paddingLeft: 20
    },
    itemFundo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    }
})
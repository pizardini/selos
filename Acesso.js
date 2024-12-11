import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function Acesso() {

    const gerar = (tamanho) => {
        let nome = '';
        let characters = '';

        characters = tamanho < 9 ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789';

        for (let i = 0; i < tamanho; i++) {
            nome += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return nome;
    };

    const updateTotal = async () => {
        const resultado = await db.getFirstAsync('select count(id) as total from pessoa');
        setTotal(resultado.total);
    }

    const addPessoa = async () => {
        const nome = gerar(6);
        const phone = gerar(11);

        const resultado = await db.runAsync('insert into pessoa (nome, phone) values (?,?)', nome, phone);

        if (resultado.changes === 1) {
            console.log('Pessoa salva com sucesso');
            updateTotal();
        }
    }

    const showAll = async () => {
        const resultado = await db.getAllAsync('select id, nome, quantidade, foto from selo order by nome');
    }

    const removeAll = async () => {
        const resultado = await db.runAsync('delete from pessoa');
        alert(`${resultado.changes} registros apagados`);
        updateTotal();
    }

    const [total, setTotal] = useState(-1);

    const db = useSQLiteContext();

    useEffect(() => {
        updateTotal();
    }, []);

    return (
        <View>
            <Text style={{ fontSize: 30 }}>Cadastros: {total}</Text>
            <Button title='Inserir' onPress={addPessoa} />
            <Button title='Exibir todos' onPress={showAll} />
            <Button title='Remover todos' onPress={removeAll} />
        </View>
    )
}
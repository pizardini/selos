import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from './screens/list';
import Toast from 'react-native-toast-message';
import SeloScreen from './screens/add';
import { View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import AddScreen from './screens/add';
// import EditScreen from './screens/edit';


export default function App() {

  const Stack = createNativeStackNavigator();

  const handleCriarBase = async (db) => {
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('create table if not exists selo (id integer primary key not null, nome text not null, quantidade text not null, foto text not null)');
    console.log(db)
  }

  return (
    <NavigationContainer>
    <SQLiteProvider databaseName='dados.db' onInit={handleCriarBase}>
      <Stack.Navigator>
        <Stack.Screen name='list' component={ListScreen} options={{title: 'Selos'}}/>
        <Stack.Screen name='add' component={AddScreen} options={{title: 'Novo'}}/>
        {/* <Stack.Screen name='editr' component={EditScreen} options={{ title: 'Alteração' }} /> */}
      </Stack.Navigator>
      </SQLiteProvider>
      <StatusBar style="auto" />
      <Toast/>
    </NavigationContainer>
  );
}
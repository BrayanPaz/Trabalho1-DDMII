 import { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore'

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

type Tarefa = {
    id: string
    descricao: string
}
    
export default function Home() {
    const nativation = useNavigation<HomeScreenNavigationProp>()

    const loggout = () => {
        signOut(auth).then(() => {
            nativation.replace('Login')
        })
    return(
        <View style={styles.container}>
            <Text>Bem-Viado</Text>
            <Text>Logado como: {auth.currentUser?.email}</Text>
            <Button title='Sair' onPress={loggout} color = '#b31111' />
        </View>
    )
    
    const [novaTarefa, setNovaTarefa] = useState<Tarefa[]>([])

    const tarefasCollectionRef = collection(db, 'tarefas')

    useEffect(() => {
        const q = query(tarefasCollectionRef, where('userId', '==', auth.currentUser?.uid))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tarefasData = snapshot.docs.map(doc => ({
                id: doc.id,
                descricao: doc.data().descricao
            }))
            setNovaTarefa(tarefasData)
        })
        return () => unsubscribe()
    }, [])

    const adicionarTarefa = async () => {
        try {
            await addDoc(tarefasCollectionRef, {
                descricao: 'Nova Tarefa',
                userId: auth.currentUser?.uid
            })
        } catch (error) {
            console.error('Erro ao adicionar tarefa: ', error)
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
}) }
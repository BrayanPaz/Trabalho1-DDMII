import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { Donghua } from '../types/Donghua';

type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>;
type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>;

interface Props {
  navigation: EditScreenNavigationProp;
  route: EditScreenRouteProp;
}

export default function Edit({ navigation, route }: Props) {
  const { item } = route.params; // Obra passada pela rota

  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState<Donghua['status']>(item.status);
  const [currentEp, setCurrentEp] = useState(item.currentEp.toString());
  
  const [date, setDate] = useState(item.nextEpDate ? new Date(item.nextEpDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasSelectedDate, setHasSelectedDate] = useState(!!item.nextEpDate);

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title || !currentEp) {
      Alert.alert("Aviso", "Título e Episódio são obrigatórios.");
      return;
    }
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const dateString = hasSelectedDate ? date.toISOString().split('T')[0] : '';
      
      const updatedData = {
        title,
        status,
        currentEp: parseInt(currentEp) || 0,
        nextEpDate: dateString,
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'donghuas', item.id), updatedData);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Erro", "Ocorreu um erro ao atualizar a obra.");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setHasSelectedDate(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Obra</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título da Obra</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Soul Land"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {['Assistindo', 'Pausado', 'Finalizado'].map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                onPress={() => setStatus(s as Donghua['status'])}
              >
                <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Último Episódio Visto</Text>
          <TextInput
            style={styles.input}
            value={currentEp}
            onChangeText={setCurrentEp}
            keyboardType="numeric"
            placeholder="Ex: 42"
            placeholderTextColor="#6b7280"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Lançamento (Próximo Ep)</Text>
          {Platform.OS === 'android' ? (
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {hasSelectedDate ? date.toLocaleDateString('pt-BR') : 'Selecionar Data'}
              </Text>
              <Feather name="calendar" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}

          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              themeVariant="dark"
            />
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Atualizar Obra</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#111827', borderBottomWidth: 1, borderColor: '#1f2937' },
  backBtn: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  form: { padding: 20, gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: '#9ca3af', fontSize: 14, marginLeft: 4 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#374151' },
  statusContainer: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  statusBtnActive: { backgroundColor: '#9333ea', borderColor: '#9333ea' },
  statusText: { color: '#9ca3af', fontSize: 14 },
  statusTextActive: { color: '#fff', fontWeight: 'bold' },
  dateButton: { backgroundColor: '#1f2937', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#374151', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateButtonText: { color: '#fff', fontSize: 16 },
  saveBtn: { backgroundColor: '#9333ea', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
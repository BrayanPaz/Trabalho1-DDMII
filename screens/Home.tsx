import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Donghua } from '../types/Donghua';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function Home({ navigation }: Props) {
  const [donghuas, setDonghuas] = useState<Donghua[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Donghua | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const donghuasRef = collection(db, 'users', auth.currentUser.uid, 'donghuas');
    
    const unsubscribe = onSnapshot(donghuasRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Donghua[];
      
      list.sort((a, b) => b.createdAt - a.createdAt);
      setDonghuas(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'donghuas', itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.log("Erro ao excluir", err);
    }
  };

  const renderItem = ({ item }: { item: Donghua }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.badges}>
            <Text style={[styles.badge, item.status === 'Assistindo' ? styles.badgeGreen : styles.badgeBlue]}>
              {item.status}
            </Text>
            <Text style={styles.badgeEp}>Ep {item.currentEp}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {/* Navega para a tela Edit passando o item */}
          <TouchableOpacity onPress={() => navigation.navigate('Edit', { item })} style={styles.iconBtn}>
            <Feather name="edit-2" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { setItemToDelete(item); setShowDeleteModal(true); }} 
            style={styles.iconBtn}
          >
            <Feather name="trash-2" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      {item.nextEpDate ? (
        <Text style={styles.dateText}>🗓 Próximo Ep: {item.nextEpDate}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Obras</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={donghuas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Sua lista está vazia.</Text>}
        />
      )}

      {/* Navega para a tela Create */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Create')}
      >
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Exclusão */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Obra?</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja apagar "{itemToDelete?.title}" da sua lista?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={[styles.modalBtn, styles.modalBtnCancel]}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={[styles.modalBtn, styles.modalBtnDelete]}>
                <Text style={styles.modalBtnText}>Apagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#111827', borderBottomWidth: 1, borderColor: '#1f2937' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16, gap: 12 },
  emptyText: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1f2937', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#374151' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  badgeGreen: { backgroundColor: '#064e3b', color: '#34d399' },
  badgeBlue: { backgroundColor: '#1e3a8a', color: '#60a5fa' },
  badgeEp: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#374151', color: '#d1d5db', overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#374151', borderRadius: 8 },
  dateText: { color: '#9ca3af', fontSize: 12, marginTop: 12 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#9333ea', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#1f2937', width: '100%', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#374151' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  modalText: { color: '#9ca3af', marginBottom: 24, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#374151' },
  modalBtnDelete: { backgroundColor: '#ef4444' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
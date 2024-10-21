import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';

const ShareScreen = () => {
  const [categories, setCategories] = useState([]); // Kategoriler backend'den geliyor
  const [selectedCategory, setSelectedCategory] = useState(''); // Seçilen kategori
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal her zaman görünür olacak
  const [ogData, setOGData] = useState(null); // OG verilerini tutacak state
  const [loading, setLoading] = useState(true); // Yükleme durumu

  const route = useRoute();
  const sharedData = route.params?.sharedData; // Paylaşılan veri buradan alınacak
console.log("sharedscreen rendered");
  // Open Graph verilerini almak için backend'e istek at
  useEffect(() => {
    if (sharedData?.text) {
      setLoading(true); // Yükleme başlat
      axios.get(`http://192.168.1.47:8082/api/ogdata?url=${sharedData.text}`)
        .then(response => {
          setOGData(response.data); // Open Graph verilerini al
          setLoading(false); // Yükleme tamamlandı
          console.log("ogdata"+response);
        })
        .catch(error => {
          console.error(error);
          setLoading(false); // Hata durumunda yüklemeyi kapat
        });
    }
  }, [sharedData]);

  // Kategorileri backend'den almak için useEffect kullanıyoruz
  useEffect(() => {
    axios.get('http://192.168.1.47:8082/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, []);

  // Veriyi backend'e kaydetmek için handleSubmit fonksiyonu
  const handleSubmit = () => {
    if (!selectedCategory || !sharedData) {
      alert("Lütfen kategori seçin ve paylaşımın geldiğinden emin olun.");
      return;
    }

    const payload = {
      title: ogData['title'] || 'Paylaşılan Başlık',
      imageUrl: ogData['image'] || '',
      link: sharedData.text || '',
      category: { id: selectedCategory }
    };

    axios.post('http://192.168.1.47:8082/wishlist/add', payload)
      .then(response => {
        alert('Başarıyla kaydedildi!');
        setIsModalVisible(false); // Modalı kapat
      })
      .catch(error => console.error(error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paylaşılan İçerik</Text>

      {loading ? (
        <Text>Yükleniyor...</Text>
      ) : (
        ogData && (
          <View style={styles.sharedDataContainer}>
            <Text>Başlık: {ogData['title']}</Text>
            {/* Resmi görüntüleme */}
            {ogData['image'] ? (
              <Image source={{ uri: ogData['image'] }} style={styles.image} />
            ) : (
              <Text>Resim bulunamadı</Text>
            )}
            <Text>Link: {sharedData.text}</Text>
          </View>
        )
      )}

      {/* Kategori seçimi */}
      <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.selectCategoryButton}>
        <Text style={styles.buttonText}>Kategori Seç</Text>
      </TouchableOpacity>

      {/* Kategori seçimi için Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seçin</Text>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Kategori Seçin" value="" />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sharedDataContainer: { marginBottom: 20 },
  selectCategoryButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  image: { width: 200, height: 200, marginBottom: 10 }, // Resim stili
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, marginBottom: 10 },
  picker: { height: 50, marginBottom: 20 },
  submitButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center' },
});

export default ShareScreen;

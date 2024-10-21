import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // Kategoriler burada saklanıyor
  const [newItem, setNewItem] = useState({ title: '', imageUrl: '', link: '', category: '' });
  const [isModalVisible, setIsModalVisible] = useState(false); // Yeni item modalı
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false); // Yeni kategori modalı
  const [newCategory, setNewCategory] = useState(''); // Yeni kategori adı
  const [expandedCategoryId, setExpandedCategoryId] = useState(null); // Genişletilen kategoriyi takip eden state
  console.log("HomePage Component Rendered");
  useEffect(() => {
    console.log("Items: ", items);
  }, [items]); 
  // Verileri yüklemek için useEffect
  useEffect(() => {
    axios.get('http://192.168.1.47:8082/wishlist/list')
      .then(response => setItems(response.data),  console.log("response"))
      .catch(error => console.error(error));

    axios.get('http://192.168.1.47:8082/categories') // Kategorileri çekiyoruz
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleSubmit = () => {
    const payload = {
       ...newItem,
       category: {
          id: newItem.category, // sadece category ID
       }
    };
    
    axios.post('http://192.168.1.47:8082/wishlist/add', payload)
       .then(response => {
          setItems([...items, response.data]);
          setIsModalVisible(false);
       })
       .catch(error => console.error(error));
 };

 const handleAddCategory = () => {
  axios.post('http://192.168.1.47:8082/categories/add', { name: newCategory })
    .then(() => {
      // Yeni kategori ekledikten sonra kategorileri tekrar çekiyoruz
      axios.get('http://192.168.1.47:8082/categories')
        .then(response => {
          setCategories(response.data); // Yeni kategoriyi dahil ederek kategorileri güncelliyoruz
          setNewCategory(''); // Yeni kategori alanını temizle
          setIsCategoryModalVisible(false); // Kategori ekleme modalını kapat
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
};

  const toggleCategory = (categoryId) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null); // Eğer kategori zaten genişletilmişse, kapat
    } else {
      setExpandedCategoryId(categoryId); // Değilse kategori ID'sini ayarla
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>

      {/* Yeni Ekle Butonu */}
      <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
        <Text style={styles.buttonText}>New Item</Text>
      </TouchableOpacity>

      {/* Yeni Kategori Butonu */}
      <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} style={styles.addButton}>
        <Text style={styles.buttonText}>New Category</Text>
      </TouchableOpacity>

      {/* Modal (Yeni Ürün Ekleme) */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Ürün Başlığı"
              value={newItem.title}
              onChangeText={(text) => setNewItem({ ...newItem, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Görsel URL"
              value={newItem.imageUrl}
              onChangeText={(text) => setNewItem({ ...newItem, imageUrl: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ürün Linki"
              value={newItem.link}
              onChangeText={(text) => setNewItem({ ...newItem, link: text })}
            />
            {/* Dropdown'dan kategori seçimi */}
            <Picker
              selectedValue={newItem.category}
              onValueChange={(itemValue) => setNewItem({ ...newItem, category: itemValue })} // Kategori ID'si seçilecek
              style={styles.picker}
            >
              <Picker.Item label="Kategori Seçin" value="" />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id} /> // value'ya category ID'sini koyduk
              ))}
            </Picker>
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal (Yeni Kategori Ekleme) */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Yeni Kategori Adı"
              value={newCategory}
              onChangeText={(text) => setNewCategory(text)}
            />
            <TouchableOpacity onPress={handleAddCategory} style={styles.button}>
              <Text style={styles.buttonText}>Kategori Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kategorileri Listele */}
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {/* Kategori Başlığı ve Tıklanabilir */}
            <TouchableOpacity onPress={() => toggleCategory(item.id)}>
              <Text style={styles.itemTitle}>{item.name}</Text>
            </TouchableOpacity>
            
            {/* Seçilen kategorinin itemları */}
            {expandedCategoryId === item.id && (
              <FlatList
                data={items.filter(i => i.category?.id === item.id)} // Kategori ID'sine göre filtreleme
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.subItemContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    <Text>{item.title}</Text>
                    <Text>{item.link}</Text>
                  </View>
                )}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});

export default HomePage;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, FlatList, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // React Native Vector Icons üzerinden Ionicons importu

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', imageUrl: '', link: '', category: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      axios.get('http://192.168.1.47:8082/wishlist/list')
        .then(response => {
          setItems(response.data);
        })
        .catch(error => console.error(error));

      axios.get('http://192.168.1.47:8082/categories')
        .then(response => setCategories(response.data))
        .catch(error => console.error(error));
    }, [])
  );

  const handleSubmit = () => {
    const payload = {
      ...newItem,
      category: {
        id: newItem.category,
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
        axios.get('http://192.168.1.47:8082/categories')
          .then(response => {
            setCategories(response.data);
            setNewCategory('');
            setIsCategoryModalVisible(false);
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  };

  const toggleCategory = (categoryId) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(categoryId);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => toggleCategory(item.id)}>
        <Text style={styles.itemTitle}>{item.name}</Text>
      </TouchableOpacity>
      {expandedCategoryId === item.id && (
        <FlatList
          data={items.filter(i => i.category?.id === item.id)}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.subItemContainer}>
              <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(item.link)} style={styles.titleContainer}>
                <Text style={styles.itemTitleWrap}>{item.title}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            {/* Yeni Ekle Butonu */}
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.smallIconButton}>
              <Icon name="add-circle" size={20} color="white" />
              <Text style={styles.buttonText}>New Item</Text>
            </TouchableOpacity>

            {/* Yeni Kategori Butonu */}
            <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} style={styles.smallIconButton}>
              <Icon name="folder" size={20} color="white" />
              <Text style={styles.buttonText}>New Category</Text>
            </TouchableOpacity>
          </View>

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
                  onValueChange={(itemValue) => setNewItem({ ...newItem, category: itemValue })}
                  style={styles.picker}
                >
                  <Picker.Item label="Kategori Seçin" value="" />
                  {categories.map((category) => (
                    <Picker.Item key={category.id} label={category.name} value={category.id} />
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
        </View>
      }
      data={categories}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderCategoryItem}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  input: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  smallIconButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    borderColor: '#007bff', // Mavi temalı sınır
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 12,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007bff',
  },
  subItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  itemImage: {
    width: 90, // Resmi büyüttüm
    height: 90, // Resmi büyüttüm
    marginRight: 10,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10 // Başlığın sağa yaslanmasını engelleyip sola boşluk verdim
  },
  itemTitleWrap: {
    flexWrap: 'wrap',
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 5,
  },
});

export default HomePage;

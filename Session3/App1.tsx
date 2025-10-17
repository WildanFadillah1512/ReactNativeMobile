import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';

// Definisikan tipe data produk
type Product = {
  id: string;
  name: string;
  price: number;
  qty: number;
  total: number;
};

// Definisikan tipe data transaksi
type Transaction = {
  id: string;
  items: Product[];
  total: number;
  date: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  saveButtonContainer: {
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  productItem: {
    backgroundColor: '#e9ecef',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#d1e7dd',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  historyText: {
    fontSize: 16,
  },
});

const App = () => {
  const [productName, setProductName] = useState<string>('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [productQty, setProductQty] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);

  const addProduct = () => {
    if (productName && productPrice && productQty) {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productName,
        price: parseFloat(productPrice),
        qty: parseInt(productQty),
        total: parseFloat(productPrice) * parseInt(productQty),
      };
      setProducts((prev) => [...prev, newProduct]);
      setProductName('');
      setProductPrice('');
      setProductQty('');
    } else {
      alert('⚠️ Harap isi semua field dengan benar!');
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const totalBelanja = products.reduce((sum, item) => sum + item.total, 0);

  const saveTransaction = () => {
    if (products.length === 0) {
      alert('⚠️ Belum ada produk yang ditambahkan!');
      return;
    }
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      items: products,
      total: totalBelanja,
      date: new Date().toLocaleString(),
    };
    setHistory((prev) => [newTransaction, ...prev]);
    setProducts([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛒 Aplikasi Kasir Mini</Text>

      <TextInput
        style={styles.input}
        placeholder="nama produk"
        value={productName}
        placeholderTextColor="#888" 
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="harga produk"
        keyboardType="numeric"
        value={productPrice}
        onChangeText={setProductPrice}
        placeholderTextColor="#888" 
      />
      <TextInput
        style={styles.input}
        placeholder="jumlah produk"
        keyboardType="numeric"
        value={productQty}
        onChangeText={setProductQty}
        placeholderTextColor="#888" 
      />

      <View style={styles.buttonContainer}>
        <Button title="➕ Tambah Produk" onPress={addProduct} />
      </View>

      <FlatList<Product>
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Product }) => (
          <View style={styles.productItem}>
            <Text style={styles.productText}>
              {item.name} - {item.qty} x Rp {item.price.toLocaleString()} = Rp {item.total.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(item.id)}
            >
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.totalText}>
        💰 Total Belanja: Rp {totalBelanja.toLocaleString()}
      </Text>

      <View style={{ marginVertical: 10 }}>
        <Button title="💾 Simpan Transaksi" onPress={saveTransaction} />
      </View>

      <Text style={styles.historyTitle}>📜 Riwayat Transaksi</Text>
      <FlatList<Transaction>
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Transaction }) => (
          <View style={styles.historyItem}>
            <Text style={styles.historyText}>
              📅 {item.date}
            </Text>
            <Text style={styles.historyText}>
              Total: Rp {item.total.toLocaleString()}
            </Text>
            {item.items.map((prod: Product) => (
              <Text key={prod.id} style={{ marginLeft: 10 }}>
                • {prod.name} ({prod.qty} x Rp {prod.price.toLocaleString()})
              </Text>
            ))}
          </View>
        )}
      />
    </ScrollView>
  );
};

export default App;

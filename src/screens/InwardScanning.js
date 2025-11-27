import { Text, View, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function InwardScanning() {
  const [scannedItems, setScannedItems] = useState([]);
  const [scannedBarcodes, setScannedBarcodes] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Demo data for the list
  const DEMO_DATA = [
    { id: '1', barcode: 'BC001', itemName: 'Item A', quantity: 10 },
    { id: '2', barcode: 'BC002', itemName: 'Item B', quantity: 5 },
    { id: '3', barcode: 'BC003', itemName: 'Item C', quantity: 8 },
  ];

  // Function to process barcode scan
  const processBarcodeData = (scannedCode) => {
    console.log('Scanned Code:', scannedCode);
    
    // Find the item in demo data
    const foundItem = DEMO_DATA.find(item => item.barcode === scannedCode);
    
    if (foundItem) {
      console.log('Item found:', foundItem);
      
      // Add to scanned items list if not already added
      if (!scannedItems.find(item => item.barcode === scannedCode)) {
        setScannedItems(prev => [...prev, foundItem]);
        setScannedBarcodes(prev => [...prev, scannedCode]);
        Alert.alert('Success', `${foundItem.itemName} added to list`);
      } else {
        Alert.alert('Info', 'Item already scanned');
      }
      
      return true;
    } else {
      console.log('Item not found');
      Alert.alert('Error', 'Scanned item is not in the list');
      return false;
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    processBarcodeData(data);
    
    // Reset scanner after 2 seconds
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const handleFinalise = () => {
    console.log('Finalising scanned barcodes:', scannedBarcodes);
    Alert.alert(
      'Finalise',
      `Ready to send ${scannedBarcodes.length} items to server`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Call your API here with scannedBarcodes
            console.log('Sending to server:', scannedBarcodes);
            // Reset lists after successful send
            // setScannedItems([]);
            // setScannedBarcodes([]);
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.barcode}>{item.barcode}</Text>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text style={styles.quantity}>Qty: {item.quantity}</Text>
    </View>
  );

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need camera permission to scan barcodes</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inward Scanning</Text>
      
      {/* Barcode Scanner */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'code128',
              'code39',
              'code93',
              'upc_a',
              'upc_e',
            ],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>
              {scanned ? 'Processing...' : 'Point camera at barcode'}
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Scanned List */}
      <View style={styles.listContainer}>
        <Text style={styles.listCaption}>Scanned List ({scannedItems.length})</Text>
        <FlatList
          data={scannedItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.flatList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items scanned yet</Text>
          }
        />
      </View>

      {/* Finalise Button */}
      <TouchableOpacity 
        style={[styles.finaliseButton, scannedItems.length === 0 && styles.disabledButton]}
        onPress={handleFinalise}
        disabled={scannedItems.length === 0}
      >
        <Text style={styles.finaliseButtonText}>Finalise the List</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scannerContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scannerText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  listCaption: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  flatList: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  barcode: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    flex: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
  },
  finaliseButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  finaliseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { Search, Filter, Package } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Picker } from '@/components/ui/Picker';
import { Colors } from '@/constants/colors';
import {
  PRODUCT_CATALOG,
  searchProducts,
  getProductCategories,
} from '@/constants/production';
import { ProductCatalog } from '@/types/production';

type FilterType = 'all' | 'category';

export default function ProductCatalogScreen() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const categories = useMemo(() => getProductCategories(), []);

  const filteredProducts = useMemo(() => {
    let products = PRODUCT_CATALOG;

    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      products = searchProducts(searchQuery);
    }

    // Aplicar filtro de categoría
    if (filterType === 'category' && selectedCategory) {
      products = products.filter(product => product.category === selectedCategory);
    }

    return products;
  }, [searchQuery, filterType, selectedCategory]);

  const handleProductPress = (product: ProductCatalog) => {
    console.log('Producto seleccionado:', product);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSelectedCategory('');
    setShowFilters(false);
  };

  const renderProductItem = ({ item }: { item: ProductCatalog }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
      testID={`product-${item.code}`}
    >
      <Card style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Package size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productCode}>{item.code}</Text>
            <Text style={styles.productCategory}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.tabIconDefault} style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            testID="search-input"
            placeholderTextColor={Colors.light.tabIconDefault}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          testID="filter-button"
        >
          <Filter size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filtrar por:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'all' && styles.filterOptionActive,
                ]}
                onPress={() => setFilterType('all')}
                testID="filter-all"
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterType === 'all' && styles.filterOptionTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'category' && styles.filterOptionActive,
                ]}
                onPress={() => setFilterType('category')}
                testID="filter-category"
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterType === 'category' && styles.filterOptionTextActive,
                  ]}
                >
                  Categoría
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {filterType === 'category' && (
            <View style={styles.categoryPickerContainer}>
              <Picker
                label="Categoría"
                value={selectedCategory}
                onSelect={setSelectedCategory}
                options={[
                  { key: '', label: 'Seleccionar categoría...' },
                  ...categories.map(category => ({
                    key: category,
                    label: category,
                  })),
                ]}
                placeholder="Seleccionar categoría"
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
            testID="clear-filters"
          >
            <Text style={styles.clearFiltersText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Mostrando {filteredProducts.length} de {PRODUCT_CATALOG.length} productos
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Catálogo de Productos',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.text,
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        testID="products-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    padding: 12,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filtersContainer: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  filterOptionTextActive: {
    color: 'white',
    fontWeight: '600' as const,
  },
  categoryPickerContainer: {
    marginTop: 12,
  },
  clearFiltersButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statsContainer: {
    padding: 12,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statsText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
  },
  productItem: {
    marginBottom: 12,
  },
  productCard: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E53E3E15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
});
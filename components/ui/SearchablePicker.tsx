import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Option {
  key: string;
  label: string;
}

interface SearchablePickerProps {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export function SearchablePicker({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seleccionar...',
  required = false,
  error,
}: SearchablePickerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const selectedOption = options.find(option => option.key === value);

  const handleSelect = (selectedValue: string) => {
    if (!selectedValue || selectedValue.length > 100) {
      return;
    }
    const sanitized = selectedValue.trim();
    if (!sanitized) {
      return;
    }
    onSelect(sanitized);
    setIsVisible(false);
    setSearchText('');
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
        ]}
        onPress={() => setIsVisible(true)}
        testID={`searchable-picker-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Text style={[
          styles.triggerText,
          !selectedOption && styles.placeholderText,
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={Colors.light.tabIconDefault} />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                testID="close-searchable-picker"
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.light.tabIconDefault} />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar..."
                placeholderTextColor={Colors.light.tabIconDefault}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                >
                  <X size={16} color={Colors.light.tabIconDefault} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.key}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.key === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.key)}
                  testID={`option-${item.key}`}
                >
                  <Text style={[
                    styles.optionText,
                    item.key === value && styles.selectedOptionText,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No se encontraron resultados</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  required: {
    color: '#ef4444',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  triggerError: {
    borderColor: '#ef4444',
  },
  triggerText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  placeholderText: {
    color: Colors.light.tabIconDefault,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: screenHeight * 0.8,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    margin: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
  },
});
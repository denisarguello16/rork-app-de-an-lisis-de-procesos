import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

interface PickerOption {
  key: string;
  label: string;
}

interface PickerProps {
  label: string;
  value: string | null;
  options: PickerOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const Picker: React.FC<PickerProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seleccionar...',
  required = false,
  error,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const selectedOption = options.find(option => option.key === value);

  const handleSelect = (optionKey: string) => {
    if (!optionKey || optionKey.length > 100) {
      console.log('[Picker] Invalid option key:', optionKey);
      return;
    }
    const sanitized = optionKey.trim();
    if (!sanitized) {
      console.log('[Picker] Empty sanitized value');
      return;
    }
    console.log('[Picker] Selected:', sanitized);
    onSelect(sanitized);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.picker, error && styles.pickerError]}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.pickerText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={() => setIsVisible(false)}
          />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              style={styles.optionsList}
              onLayout={() => console.log('[Picker] Options count:', options.length, 'Options:', options.map(o => o.label).join(', '))}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item.key && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item.key)}
                >
                  <Text style={[
                    styles.optionText,
                    value === item.key && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {value === item.key && (
                    <Check size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  pickerError: {
    borderColor: '#ef4444',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholder: {
    color: '#9ca3af',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '500',
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#10b981',
    fontWeight: '500',
  },
});
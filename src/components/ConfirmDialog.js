import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmDialog({ visible, message, onYes, onNo }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
          {/* Dialog Message */}
          <Text className="text-alertColor text-base font-semibold text-center mb-5">{message || "Are you sure?"}</Text>

          {/* Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={onNo} className="flex-1 bg-gray-300 py-2 rounded-full mx-1 active:opacity-80">
              <Text className="text-gray-700 text-center font-semibold text-base">No</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onYes} className="flex-1 bg-buttonBackground py-2 rounded-full mx-1 active:opacity-80">
              <Text className="text-white text-center font-semibold text-base">Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

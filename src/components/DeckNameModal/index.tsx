import { useState } from "react";
import { View, Text, Input, Switch } from "@tarojs/components";
import "./index.scss";

interface DeckNameModalProps {
  title: string;
  value: string;
  error: string;
  confirmText: string;
  isJa?: boolean;
  onInput: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  onToggleJa?: () => void;
}

export default function DeckNameModal({
  title,
  value,
  error,
  confirmText,
  isJa = false,
  onInput,
  onConfirm,
  onClose,
  onToggleJa,
}: DeckNameModalProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  return (
    <View className="modal-overlay" onClick={onClose}>
      <View
        className="modal-sheet"
        style={{ marginBottom: keyboardHeight ? `${keyboardHeight}px` : "0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Text className="modal-title">{title}</Text>
        <Input
          className={`modal-input ${error ? "modal-input--error" : ""}`}
          value={value}
          onInput={(e) => onInput(e.detail.value)}
          onKeyboardHeightChange={(e) => setKeyboardHeight(e.detail.height)}
          placeholder="输入卡组名称..."
          maxlength={30}
          adjustPosition={false}
          focus
        />
        {error ? <Text className="modal-error">{error}</Text> : null}

        {onToggleJa && (
          <View
            className="modal-toggle-row"
            onClick={(e) => {
              e.stopPropagation();
              onToggleJa();
            }}
          >
            <View className="modal-toggle-label">
              <Text className="modal-toggle-title">日语词典模式</Text>
              <Text className="modal-toggle-desc">
                显示读音、释义和查词功能
              </Text>
            </View>
            <Switch checked={isJa} color="#F4845F" onChange={onToggleJa} />
          </View>
        )}

        <View className="modal-actions">
          <View className="modal-btn modal-btn--cancel" onClick={onClose}>
            <Text>取消</Text>
          </View>
          <View
            className={`modal-btn modal-btn--confirm ${
              !value.trim() ? "modal-btn--disabled" : ""
            }`}
            onClick={onConfirm}
          >
            <Text>{confirmText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

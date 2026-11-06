import { useState } from "react";
import type { Key } from "react";

export function useFacilitySelection() {
  const [selectedUserKeys, setSelectedUserKeys] = useState<Key[]>([]);

  const [selectedDeviceKeys, setSelectedDeviceKeys] = useState<Key[]>([]);

  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<Key[]>([]);

  const [selectedPlaylistKeys, setSelectedPlaylistKeys] = useState<Key[]>([]);

  const resetSelection = () => {
    setSelectedUserKeys([]);
    setSelectedDeviceKeys([]);
    setSelectedMediaIds([]);
    setSelectedTemplateKeys([]);
    setSelectedPlaylistKeys([]);
  };

  return {
    selectedUserKeys,
    setSelectedUserKeys,

    selectedDeviceKeys,
    setSelectedDeviceKeys,

    selectedMediaIds,
    setSelectedMediaIds,

    selectedTemplateKeys,
    setSelectedTemplateKeys,

    selectedPlaylistKeys,
    setSelectedPlaylistKeys,

    resetSelection,
  };
}

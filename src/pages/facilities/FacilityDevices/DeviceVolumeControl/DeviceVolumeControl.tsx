import { useEffect, useState } from "react";
import { Slider } from "antd";
import { Volume2 } from "lucide-react";
import "./DeviceVolumeControl.css";

interface DeviceVolumeControlProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

function DeviceVolumeControl({
  initialValue = 50,
  onChange,
}: DeviceVolumeControlProps) {
  const [volume, setVolume] = useState(initialValue);

  useEffect(() => {
    setVolume(initialValue);
  }, [initialValue]);

  return (
    <div className="device-volume-control">
      <Volume2
        size={24}
        color="#F26D21"
        strokeWidth={2}
        className="device-volume-control__icon"
      />

      <Slider
        min={0}
        max={100}
        step={1}
        value={volume}
        onChange={setVolume}
        onChangeComplete={(value) => onChange?.(value)}
        tooltip={{ open: false }}
        className="device-volume-control__slider"
      />

      <span className="device-volume-control__value">{volume}</span>
    </div>
  );
}

export default DeviceVolumeControl;

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
        value={initialValue}
        onChange={onChange}
        tooltip={{ open: false }}
        className="device-volume-control__slider"
      />

      <span className="device-volume-control__value">{initialValue}</span>
    </div>
  );
}

export default DeviceVolumeControl;

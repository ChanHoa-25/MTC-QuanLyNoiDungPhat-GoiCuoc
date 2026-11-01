import { useState } from "react";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

import vietnamFlag from "../../../assets/images/vietnam-flag.png";
import ukFlag from "../../../assets/images/uk-flag.png";

import "./AppLanguage.css";

export type Language = "vi" | "en";

interface AppLanguageProps {
  className?: string;
  value?: Language;
  onChange?: (language: Language) => void;
}

const languages = {
  vi: {
    code: "VIE",
    flag: vietnamFlag,
  },
  en: {
    code: "ENG",
    flag: ukFlag,
  },
};

function AppLanguage({ className = "", value, onChange }: AppLanguageProps) {
  const [internalLanguage, setInternalLanguage] = useState<Language>("vi");

  const [open, setOpen] = useState(false);

  const language = value ?? internalLanguage;

  const handleSelect = (selected: Language) => {
    if (value === undefined) {
      setInternalLanguage(selected);
    }

    onChange?.(selected);
    setOpen(false);
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomLeft"
      popupRender={() => (
        <div className="app-language__dropdown">
          {(["vi", "en"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={[
                "app-language__option",
                language === item ? "app-language__option--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(item)}>
              <img
                src={languages[item].flag}
                alt=""
                className="app-language__flag"
              />

              <span>{languages[item].code}</span>
            </button>
          ))}
        </div>
      )}>
      <button
        type="button"
        className={`app-language ${className}`.trim()}
        aria-label="Chọn ngôn ngữ"
        aria-expanded={open}
        aria-haspopup="menu">
        <span className="app-language__current">
          <img
            src={languages[language].flag}
            alt=""
            className="app-language__flag"
          />

          <span className="app-language__code">{languages[language].code}</span>
        </span>

        <DownOutlined
          className={`app-language__arrow ${
            open ? "app-language__arrow--open" : ""
          }`}
        />
      </button>
    </Dropdown>
  );
}

export default AppLanguage;

import { useState } from "react";
import { Button, Menu } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import data from '../i18n/locales/LanguageSelectorList.json'

export function LanguageSelector() {
  const {i18n} = useTranslation();

  function getMatchI18nLanguage() {
    const filter = data
      .filter(item => item.locale.match(i18n.language));
    return (filter.length > 0) ? filter.at(0) : undefined;
  }

  const matchI18nLanguage = getMatchI18nLanguage();

  const [selected, setSelected] = useState(matchI18nLanguage ? matchI18nLanguage : data[0]);

  const items = data.map((item) => (
    <Menu.Item
      onClick={() =>
        i18n.changeLanguage(item.locale)
          .then(() => setSelected(item))}
      key={item.locale}
    >
      {item.variant}
    </Menu.Item>
  ));

  return (
    <Menu
      radius="md"
      withinPortal
      withArrow={true}
      variant="outline"
    >
      <Menu.Target>
        <Button
          variant="outline"
          color="gray"
          rightIcon={<IconLanguage size={18} />}
        >
          <span>{selected.language}</span>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>

  );
}
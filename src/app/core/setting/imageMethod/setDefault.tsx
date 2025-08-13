import { Button } from "@/components/ui/button";
import { SettingRow } from "../components/setting-base";
import { useTranslations } from 'next-intl';
import { useEffect } from "react";
import useSettingStore from "@/stores/setting";
import { Store } from "@tauri-apps/plugin-store";

export function SetDefault({type}: {type: 'ocr' | 'vlm'}) {
  const t = useTranslations('settings.imageMethod');
  const { primaryImageMethod, setPrimaryImageMethod } = useSettingStore()

  async function init() {
    const store = await Store.load('store.json');
    const method = await store.get<'ocr' | 'vlm'>('primaryImageMethod') || 'ocr'
    setPrimaryImageMethod(method)
  }

  async function handleSetPrimary() {
    setPrimaryImageMethod(type)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <SettingRow className="mt-4">
      {primaryImageMethod === type ? (
        <Button disabled variant="outline">
          {t('isPrimary', { type: type.toUpperCase() })}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          onClick={handleSetPrimary}
        >
          {t('setPrimary')}
        </Button>
      )}
    </SettingRow>
  )
}
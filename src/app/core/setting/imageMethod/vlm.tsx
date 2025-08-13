import { SettingPanel } from "../components/setting-base";
import { ModelSelect } from "../components/model-select";
import { Bot } from "lucide-react";
import { useTranslations } from 'next-intl';
import { SetDefault } from "./setDefault";

export function VlmSetting() {
  const t = useTranslations('settings.imageMethod.vlm')
  return (
    <>
      <SettingPanel title={t('title')} desc={t('desc')} icon={<Bot className="size-4" />}>
        <ModelSelect modelKey={'imageMethod'} />
      </SettingPanel>
      <SetDefault type="vlm" />
    </> 
  )
}
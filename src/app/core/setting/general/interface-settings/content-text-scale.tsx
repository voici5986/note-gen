'use client'
import { useTranslations } from 'next-intl'
import { SettingPanel } from '../../components/setting-base'
import { Type } from 'lucide-react'
import { Slider } from "@/components/ui/slider"
import useSettingStore from '@/stores/setting'

export function ContentTextScaleSettings() {
  const t = useTranslations('settings.general.interface')
  const { contentTextScale, setContentTextScale } = useSettingStore()

  const handleScaleChange = (value: number[]) => {
    setContentTextScale(value[0])
  }

  return (
    <SettingPanel
      title={t('contentTextScale.title')}
      desc={t('contentTextScale.desc')}
      icon={<Type className="size-4" />}
    >
      <div className="space-y-3 w-[180px]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">75%</span>
          <span className="text-xs font-medium">{contentTextScale}%</span>
          <span className="text-xs text-muted-foreground">150%</span>
        </div>
        <Slider
          value={[contentTextScale]}
          onValueChange={handleScaleChange}
          min={75}
          max={150}
          step={1}
          className="w-full"
        />
      </div>
    </SettingPanel>
  )
}
"use client"

import { BotMessageSquare, BotOff, Drama } from "lucide-react"
import usePromptStore from "@/stores/prompt"
import useSettingStore from "@/stores/setting"
import { NewChat } from "./new-chat"
import { RemoveChat } from "./remove-chat"
import { useTranslations } from "next-intl"

export function ChatHeader() {
  const t = useTranslations('record.chat.header')
  const { currentPrompt } = usePromptStore()
  const { primaryModel, aiModelList } = useSettingStore()

  return (
    <header className="h-12 w-full grid grid-cols-[auto_1fr_auto] items-center border-b px-4 text-sm gap-4">
      <div className="flex items-center gap-1">
        <Drama className="size-4" />
        {currentPrompt?.title}
      </div>
      <div className="flex items-center justify-center gap-1">
        {
          aiModelList?.find(model => model.key === primaryModel) ?
          <>
            <BotMessageSquare className="!size-4" />
            <span className="line-clamp-1 flex-1 md:flex-none">
              {aiModelList?.find(model => model.key === primaryModel)?.model}
              ({aiModelList?.find(model => model.key === primaryModel)?.title})
            </span>
          </> :
          <>
            <BotOff className="!size-4" />
            <span>{t('noModel')}</span>
          </>
        }
      </div>
      <div className="flex items-center gap-1">
        <NewChat />
        <RemoveChat />
      </div>
    </header>
  )
}

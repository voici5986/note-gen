import { TooltipButton } from "@/components/tooltip-button";
import { fetchAiStreamToken } from "@/lib/ai";
import useArticleStore from "@/stores/article";
import useSettingStore from "@/stores/setting";
import emitter from "@/lib/emitter";
import { Sparkles } from "lucide-react";
import Vditor from "vditor";
import { useTranslations } from "next-intl";

export default function Polish({editor, value}: {editor?: Vditor, value?: string}) {
  const { loading } = useArticleStore()
  const { primaryModel } = useSettingStore()
  const t = useTranslations('article.editor.toolbar.polish')

  async function handler() {
    if (!value) return
    editor?.deleteValue()
    editor?.disabled()
    emitter.emit('toolbar-reset-selected-text')
    const req = t('promptTemplate', {content: value})
    await fetchAiStreamToken(req, (text) => {
      editor?.insertValue(text)
    })
    editor?.enable()
  }

  return (
    <TooltipButton disabled={loading || !primaryModel} icon={<Sparkles />} tooltipText={t('tooltip')} onClick={handler}>
    </TooltipButton>
  )
}
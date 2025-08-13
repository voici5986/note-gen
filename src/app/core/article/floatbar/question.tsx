import { TooltipButton } from "@/components/tooltip-button";
import { fetchAiStreamToken } from "@/lib/ai";
import emitter from "@/lib/emitter";
import useSettingStore from "@/stores/setting";
import { MessageCircleQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import Vditor from "vditor";
import useArticleStore from "@/stores/article";

export default function Question({editor, value}: {editor?: Vditor, value?: string}) {
  const { primaryModel } = useSettingStore()
  const t = useTranslations('article.editor.toolbar.question')
  const { currentArticle } = useArticleStore()
  
  async function handleBlock() {
    if (!value) return
    emitter.emit('toolbar-reset-selected-text')
    editor?.disabled()
    editor?.insertEmptyBlock('afterend')
    const req = t('promptTemplate', {content: currentArticle, question: value})
    await fetchAiStreamToken(req, (text) => {
      editor?.insertValue(text, true)
    })
    editor?.enable()
  }

  return (
    <TooltipButton disabled={!primaryModel} icon={<MessageCircleQuestion />} tooltipText={t('tooltip')} onClick={handleBlock}>
    </TooltipButton>
  )
}

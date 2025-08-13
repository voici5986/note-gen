import { TooltipButton } from "@/components/tooltip-button";
import { fetchAiStreamToken } from "@/lib/ai";
import { EraserIcon } from "lucide-react";
import Vditor from "vditor";
import { useTranslations } from "next-intl";

export default function Eraser({editor, value}: {editor?: Vditor, value?: string}) {
  const t = useTranslations('article.editor.toolbar.eraser')
  async function handleBlock() {
    if (value) {
      editor?.deleteValue()
      editor?.disabled()
      const req = t('promptTemplate', {content: value})
      await fetchAiStreamToken(req, (text) => {
        editor?.insertValue(text, true)
      })
      editor?.enable()
    }
  }
  return (
    <TooltipButton icon={<EraserIcon />} tooltipText={t('tooltip')} onClick={handleBlock}>
    </TooltipButton>
  )
}
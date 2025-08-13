"use client"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Send, Square } from "lucide-react"
import useSettingStore from "@/stores/setting"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import useChatStore from "@/stores/chat"
import useTagStore from "@/stores/tag"
import useMarkStore from "@/stores/mark"
import { fetchAiPlaceholder, fetchAiStream } from "@/lib/ai"
import { MarkGen } from "./mark-gen"
import { useTranslations } from 'next-intl'
import { ChatLink } from "./chat-link"
import { TooltipButton } from "@/components/tooltip-button"
import { useLocalStorage } from 'react-use';
import { ModelSelect } from "./model-select"
import { PromptSelect } from "./prompt-select"
import { ClearChat } from "./clear-chat"
import { ClearContext } from "./clear-context"
import { ChatLanguage } from "./chat-language"
import ChatPlaceholder from "./chat-placeholder"
import { ClipboardMonitor } from "./clipboard-monitor"
import { RagSwitch } from "./rag-switch"
import emitter from "@/lib/emitter"
import useVectorStore from "@/stores/vector"
import { getContextForQuery } from '@/lib/rag'
import { invoke } from "@tauri-apps/api/core"


export function ChatInput() {
  const [text, setText] = useState("")
  const { primaryModel } = useSettingStore()
  const { currentTagId } = useTagStore()
  const { insert, loading, setLoading, saveChat, chats, isPlaceholderEnabled, locale } = useChatStore()
  const { fetchMarks, marks, trashState } = useMarkStore()
  const [isComposing, setIsComposing] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const t = useTranslations()
  const [inputType, setInputType] = useLocalStorage('chat-input-type', 'chat')
  const markGenRef = useRef<any>(null) // Fix markGenRef type
  const { isLinkMark } = useChatStore()
  const { isRagEnabled } = useVectorStore()
  const abortControllerRef = useRef<AbortController | null>(null)

  // 终止对话功能
  function terminateChat() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  // 对话
  async function handleSubmit() {
    if (text === '') return
    setText('')
    
    // 重置 textarea 的高度为默认值
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
    }
    setLoading(true)
    await insert({
      tagId: currentTagId,
      role: 'user',
      content: text,
      type: 'chat',
      inserted: false,
      image: undefined,
    })

    const message = await insert({
      tagId: currentTagId,
      role: 'system',
      content: '',
      type: 'chat',
      inserted: false,
      image: undefined,
    })
    if (!message) return

    await fetchMarks()
    const scanMarks = isLinkMark ? marks.filter(item => item.type === 'scan') : []
    const textMarks = isLinkMark ? marks.filter(item => item.type === 'text') : []
    const imageMarks = isLinkMark ? marks.filter(item => item.type === 'image') : []
    const linkMarks = isLinkMark ? marks.filter(item => item.type === 'link') : []
    const fileMarks = isLinkMark ? marks.filter(item => item.type === 'file') : []
    const lastClearIndex = chats.findLastIndex(item => item.type === 'clear')
    const chatsAfterClear = chats.slice(lastClearIndex + 1)
    
    // 准备请求内容
    let ragContext = ''
    
    // 如果启用RAG，获取相关上下文
    if (isRagEnabled) {
      try {
        // 基于TextRank算法提取前3个关键词
        const keywords = await invoke<{text: string, weight: number}[]>('rank_keywords', { text, topK: 5 })
        // 获取相关文档内容
        ragContext = await getContextForQuery(keywords)
        
        if (ragContext) {
          // 如果获取到了相关内容，将其作为独立部分添加到请求中
          ragContext = `
Your knowledge library is the most relevant content related to this question. Please use these information to answer the question:
${ragContext}
`
        }
      } catch (error) {
        console.error('Failed to get RAG context:', error)
      }
    }

    const request_content = `
      Use ${locale} language, don't use any other language.
      ${[...scanMarks, ...textMarks, ...imageMarks, ...fileMarks, ...linkMarks].length ? 'You can refer to the following content notes:' : ''}
      ${scanMarks.length ? 'The following are screenshots after using OCR to identify text fragments:' : ''}
      ${scanMarks.map((item, index) => `${index + 1}. ${item.content}`).join(';\n\n')}
      ${textMarks.length ? 'The following are text copy records:' : ''}
      ${textMarks.map((item, index) => `${index + 1}. ${item.content}`).join(';\n\n')}
      ${imageMarks.length ? 'The following are image records:' : ''}
      ${imageMarks.map((item, index) => `${index + 1}. ${item.content}`).join(';\n\n')}
      ${linkMarks.length ? 'The following are link records:' : ''}
      ${linkMarks.map((item, index) => `${index + 1}. ${item.content}`).join(';\n\n')}
      ${fileMarks.length ? 'The following are file records:' : ''}
      ${fileMarks.map((item, index) => `${index + 1}. ${item.content}`).join(';\n\n')}
      ${chatsAfterClear.length ? 'Refer to the following chat records:' : ''}
      ${
        chatsAfterClear
          .filter((item) => item.tagId === currentTagId && item.type === "chat")
          .map((item, index) => `${index + 1}. ${item.content}`)
          .join(';\n\n')
      }
      ${ragContext.trim()}
      ${text.trim()}
    `.trim()

    // 先保存空消息，然后通过流式请求更新
    await saveChat({
      ...message,
      content: '',
    }, true)
    
    // 创建新的 AbortController 用于终止请求
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    
    // 使用流式方式获取AI结果
    let cache_content = '';
    try {
      await fetchAiStream(request_content, async (content) => {
        cache_content = content
        // 每次收到流式内容时更新消息
        await saveChat({
          ...message,
          content
        }, false)
      }, signal)
    } catch (error: any) {
      // 如果不是中止错误，则记录错误信息
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error)
      }
    } finally {
      abortControllerRef.current = null
      setLoading(false)
      await saveChat({
        ...message,
        content: cache_content
      }, true)
    }
  }

  // 获取输入框占位符
  async function genInputPlaceholder() {
    setPlaceholder(t('record.chat.input.placeholder.default'))
    if (!primaryModel) return
    if (trashState) return
    // 检查是否启用了AI占位符功能
    if (!isPlaceholderEnabled) {
      setPlaceholder(t('record.chat.input.placeholder.default'))
      return
    }
    const scanMarks = isLinkMark ? marks.filter(item => item.type === 'scan') : []
    const textMarks = isLinkMark ? marks.filter(item => item.type === 'text') : []
    const imageMarks = isLinkMark ? marks.filter(item => item.type === 'image') : []
    const fileMarks = isLinkMark ? marks.filter(item => item.type === 'file') : []
    const linkMarks = isLinkMark ? marks.filter(item => item.type === 'link') : []
    const lastClearIndex = chats.findLastIndex(item => item.type === 'clear')
    const chatsAfterClear = chats.slice(lastClearIndex + 1)
    const request_content = `
      Use ${locale} language, don't use any other language.
      ${[...scanMarks, ...textMarks, ...imageMarks, ...fileMarks, ...linkMarks]
        .slice(0, 5)
        .map(item => item.content?.replace(/<thinking>[\s\S]*?<thinking>/g, '').slice(0, 60))
        .join(';\n\n')}
      ${chatsAfterClear.slice(0, 5).map(item => item.content?.replace(/<thinking>[\s\S]*?<thinking>/g, '').slice(0, 60)).join(';\n\n')}
    `.trim()
    // 使用非流式请求获取placeholder内容
    const content = await fetchAiPlaceholder(request_content)
    setPlaceholder(content + ' [Tab]')
  }

  // 切换输入类型
  function inputTypeChangeHandler(value: string) {
    setInputType(value)
  }

  useEffect(() => {
    if (!primaryModel) {
      setPlaceholder(t('record.chat.input.placeholder.noPrimaryModel'))
      return
    }
    if (marks.length === 0) {
      setPlaceholder(t('record.chat.input.placeholder.default'))
      return
    }
    if (!isPlaceholderEnabled) {
      setPlaceholder(t('record.chat.input.placeholder.default'))
      return
    }
    genInputPlaceholder()
  }, [primaryModel, marks, isLinkMark, isPlaceholderEnabled, t])

  useEffect(() => {
    if (!isPlaceholderEnabled) {
      setPlaceholder(t('record.chat.input.placeholder.default'))
    }
  }, [placeholder, isPlaceholderEnabled])

  useEffect(() => {
    emitter.on('revertChat', (event: unknown) => {
      setText(event as string)
    })
    return () => {
      emitter.off('revertChat')
    }
  }, [])

  return (
    <footer className="relative flex flex-col border rounded-xl p-2 gap-2 mb-2 lg:w-[calc(100%-1rem)] w-full">
      <div className="relative w-full flex items-start">
        <Textarea
          className="flex-1 p-2 relative border-none text-xs placeholder:text-xs lg:placeholder:text-sm lg:text-sm focus-visible:ring-0 shadow-none min-h-[36px] max-h-[240px] resize-none overflow-y-auto"
          rows={1}
          disabled={!primaryModel || loading}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const textarea = e.target
            textarea.style.height = 'auto'
            const newHeight = Math.min(textarea.scrollHeight, 240)
            textarea.style.height = `${newHeight}px`
          }}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing && !e.shiftKey && e.keyCode === 13) {
              e.preventDefault()
              if (inputType === "gen") {
                markGenRef.current?.openGen()
              } else if (inputType === "chat") {
                handleSubmit()
              }
            }
            if (e.key === "Tab") {
              e.preventDefault()
              setText(placeholder.replace('[Tab]', ''))
            }
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setTimeout(() => {
            setIsComposing(false)
          }, 0)}
        />
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="flex">
          <ModelSelect />
          <PromptSelect />
          <ChatLanguage />
          <ChatLink inputType={inputType} />
          <RagSwitch />
          <ChatPlaceholder />
          <ClipboardMonitor />
          <ClearContext />
          <ClearChat />
        </div>
        <div className="flex items-center justify-end gap-2 pr-1">
          <Tabs value={inputType} onValueChange={inputTypeChangeHandler}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gen">{t('record.chat.input.organize')}</TabsTrigger>
              <TabsTrigger value="chat">{t('record.chat.input.chat')}</TabsTrigger>
            </TabsList>
          </Tabs>
          {
            inputType === 'gen' ?
              <MarkGen inputValue={text} ref={markGenRef} /> :
              loading ? 
                <TooltipButton 
                  variant={"ghost"}
                  size="sm"
                  icon={<Square className="text-destructive" />} 
                  tooltipText={t('record.chat.input.terminate')} 
                  onClick={terminateChat} 
                /> :
                <TooltipButton 
                  variant={"default"}
                  size="sm"
                  icon={<Send className="size-4" />} 
                  disabled={!primaryModel} 
                  tooltipText={t('record.chat.input.send')} 
                  onClick={handleSubmit} 
                />
          }
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Globe, Lock, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/store/chat-store'

type Question = {
  id: string
  text: string
  options: string[]
}

export default function CreateChannelPage() {
  const router = useRouter()
  const createChannel = useChatStore(state => state.createChannel)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', options: ['', ''] },
  ])

  function addQuestion() {
    setQuestions(current => [...current, { id: Date.now().toString(), text: '', options: ['', ''] }])
  }

  function removeQuestion(id: string) {
    setQuestions(current => current.filter(question => question.id !== id))
  }

  async function handleCreateChannel() {
    try {
      const channel = await createChannel({
        name,
        description: description || undefined,
        privacy,
        questions: privacy === 'private'
          ? questions
              .map(question => ({
                text: question.text.trim(),
                options: question.options.map(option => option.trim()).filter(Boolean),
              }))
              .filter(question => question.text && question.options.length > 0)
          : undefined,
      })

      toast.success('Channel created successfully.')
      router.push('/chat')
      await useChatStore.getState().setActiveChatId(channel.id, 'channel')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create channel.')
    }
  }

  return (
    <div className="flex-1 bg-neutral-50/30 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
          <div className="px-5 md:px-8 py-4 md:py-6 border-b border-neutral-100 flex items-center justify-between relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.back()}
              className="text-neutral-400 hover:text-neutral-600 rounded-xl relative z-10"
            >
              <ChevronLeft size={20} />
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Create Channel</h1>
            <div className="w-8 md:w-10 h-8 md:h-10 invisible" />
          </div>

          <div className="p-6 md:p-10 space-y-8 md:space-y-10">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-neutral-900">Channel Name</Label>
              <Input
                type="text"
                placeholder="e.g. product-design"
                value={name}
                onChange={event => setName(event.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="h-12 md:h-14 bg-white border-neutral-100 rounded-2xl shadow-xs text-sm placeholder:text-neutral-300"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label className="text-sm font-bold text-neutral-900">Description</Label>
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                  {description.length}/250
                </span>
              </div>
              <Textarea
                placeholder="What's this channel about?"
                value={description}
                onChange={event => setDescription(event.target.value.slice(0, 250))}
                rows={4}
                className="min-h-[100px] md:min-h-[120px] bg-white border-neutral-100 rounded-2xl text-sm placeholder:text-neutral-300 resize-none shadow-xs"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold text-neutral-900">Privacy</Label>
              <div className="p-1.5 bg-neutral-50 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                <Button
                  variant={privacy === 'public' ? 'default' : 'ghost'}
                  onClick={() => setPrivacy('public')}
                  className={`h-11 md:h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    privacy === 'public'
                      ? 'bg-cyan-400 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-100 border-none'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 border-none'
                  }`}
                >
                  <Globe size={16} /> Public
                </Button>
                <Button
                  variant={privacy === 'private' ? 'default' : 'ghost'}
                  onClick={() => setPrivacy('private')}
                  className={`h-11 md:h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    privacy === 'private'
                      ? 'bg-cyan-400 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-100 border-none'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 border-none'
                  }`}
                >
                  <Lock size={16} /> Private
                </Button>
              </div>
            </div>

            {privacy === 'private' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-sm font-bold text-neutral-900">Join Request Questions</Label>
                </div>

                <div className="space-y-6">
                  {questions.map((question, questionIndex) => (
                    <div key={question.id} className="p-5 md:p-8 border border-neutral-100 rounded-2xl md:rounded-[2rem] space-y-6 relative group bg-white shadow-xs">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeQuestion(question.id)}
                        className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </Button>

                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Question {questionIndex + 1}</span>
                        <Input
                          type="text"
                          placeholder="Enter your question here..."
                          value={question.text}
                          onChange={event => setQuestions(current => current.map(item => item.id === question.id ? { ...item, text: event.target.value } : item))}
                          className="h-11 md:h-12 bg-neutral-50/50 border-neutral-100 rounded-xl"
                        />
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Response Options</span>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <input
                              key={`${question.id}-${optionIndex}`}
                              type="text"
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={event => setQuestions(current => current.map(item => {
                                if (item.id !== question.id)
                                  return item

                                const nextOptions = [...item.options]
                                nextOptions[optionIndex] = event.target.value
                                return { ...item, options: nextOptions }
                              }))}
                              className="w-full bg-transparent border-b border-neutral-100 py-1 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuestions(current => current.map(item => item.id === question.id ? { ...item, options: [...item.options, ''] } : item))}
                            className="h-8 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Plus size={14} /> Add option
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full h-14 md:h-16 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-500 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Question
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 md:pt-6 space-y-4">
              <Button
                onClick={() => void handleCreateChannel()}
                disabled={!name.trim()}
                className="w-full h-14 md:h-16 bg-indigo-600 text-white rounded-2xl font-bold text-base md:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-[0.98]"
              >
                Create Channel
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="w-full h-11 md:h-12 text-neutral-400 hover:text-neutral-600 font-bold text-sm transition-colors rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

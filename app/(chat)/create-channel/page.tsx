'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Lock, Plus, Image as ImageIcon, Trash2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Question {
    id: string
    text: string
    options: string[]
}

export default function CreateChannelPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
    const [questions, setQuestions] = useState<Question[]>([
        { id: '1', text: 'Which department do you work in?', options: ['Engineering', 'Design', ''] }
    ])

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now().toString(), text: '', options: ['', '', ''] }])
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const updateQuestionText = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
    }

    const updateOptionText = (qId: string, index: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options]
                newOptions[index] = text
                return { ...q, options: newOptions }
            }
            return q
        }))
    }

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, ''] } : q))
    }

    return (
        <div className="flex-1 bg-neutral-50/30 overflow-y-auto">
            <div className="max-w-2xl mx-auto py-6 md:py-12 px-4 md:px-6">
                <div className="bg-white rounded-2xl md:rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
                    {/* Header */}
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
                        <div className="w-8 md:w-10 h-8 md:h-10 invisible" /> {/* Spacer */}
                    </div>

                    <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                        {/* Channel Name */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-neutral-900">Channel Name</Label>
                            <Input
                                type="text"
                                placeholder="e.g. product-design"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                className="h-12 md:h-14 bg-white border-neutral-100 rounded-2xl shadow-xs text-sm placeholder:text-neutral-300"
                            />
                            <p className="text-[11px] text-neutral-400 font-medium px-1 leading-relaxed">
                                Names must be lowercase, without spaces. They can contain hyphens.
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-sm font-bold text-neutral-900">
                                    Description <span className="text-neutral-400 font-medium">(Optional)</span>
                                </Label>
                                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                                    {description.length}/250
                                </span>
                            </div>
                            <Textarea
                                placeholder="What's this channel about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 250))}
                                rows={4}
                                className="min-h-[100px] md:min-h-[120px] bg-white border-neutral-100 rounded-2xl text-sm placeholder:text-neutral-300 resize-none shadow-xs"
                            />
                        </div>

                        {/* Privacy Toggle */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold text-neutral-900">Privacy</Label>
                            <div className="p-1.5 bg-neutral-50 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                                <Button
                                    variant={privacy === 'public' ? 'default' : 'ghost'}
                                    onClick={() => setPrivacy('public')}
                                    className={`h-11 md:h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${privacy === 'public'
                                        ? 'bg-cyan-400 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-100 border-none'
                                        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 border-none'
                                        }`}
                                >
                                    <Globe size={16} /> Public
                                </Button>
                                <Button
                                    variant={privacy === 'private' ? 'default' : 'ghost'}
                                    onClick={() => setPrivacy('private')}
                                    className={`h-11 md:h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${privacy === 'private'
                                        ? 'bg-cyan-400 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-100 border-none'
                                        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 border-none'
                                        }`}
                                >
                                    <Lock size={16} /> Private
                                </Button>
                            </div>
                            <p className="text-[11px] text-neutral-400 font-medium px-1 leading-relaxed">
                                {privacy === 'public'
                                    ? "Public channels can be found and joined by anyone in the organization."
                                    : "Private channels can only be viewed or joined by invitation."
                                }
                            </p>
                        </div>

                        {/* Join Request Questions (Private Only) */}
                        {privacy === 'private' && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-1">
                                    <Label className="text-sm font-bold text-neutral-900">Join Request Questions</Label>
                                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider leading-relaxed">Require answers before joining</p>
                                </div>

                                <div className="space-y-6">
                                    {questions.map((q, qIndex) => (
                                        <div key={q.id} className="p-5 md:p-8 border border-neutral-100 rounded-2xl md:rounded-[2rem] space-y-6 relative group bg-white shadow-xs">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeQuestion(q.id)}
                                                className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 hover:bg-red-50 sm:opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </Button>

                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Question {qIndex + 1}</span>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter your question here..."
                                                    value={q.text}
                                                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                                    className="h-11 md:h-12 bg-neutral-50/50 border-neutral-100 rounded-xl focus:bg-white text-sm font-semibold"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Response Options</span>
                                                <div className="space-y-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3 md:gap-4 px-1">
                                                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-neutral-200 shrink-0" />
                                                            <input
                                                                type="text"
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                value={opt}
                                                                onChange={(e) => updateOptionText(q.id, oIndex, e.target.value)}
                                                                className="flex-1 bg-transparent border-b border-neutral-100 py-1 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                                                            />
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addOption(q.id)}
                                                        className="h-8 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center sm:justify-start gap-1 rounded-lg w-full sm:w-auto mt-2"
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

                        {/* Channel Icon */}
                        <div className="space-y-4">
                            <Label className="text-sm font-bold text-neutral-900">Channel Icon</Label>
                            <div className="border-2 border-dashed border-neutral-100 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group bg-white shadow-xs">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-xl transition-all">
                                    <ImageIcon size={28} className="md:size-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-neutral-900">Click or drag to upload</p>
                                    <p className="text-[10px] md:text-[11px] text-neutral-400 font-medium tracking-wide">SVG, PNG or JPG (max. 2MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4 md:pt-6 space-y-4">
                            <Button className="w-full h-14 md:h-16 bg-indigo-600 text-white rounded-2xl font-bold text-base md:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-[0.98]">
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

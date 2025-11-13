"use client"
import React, { useEffect, useState } from 'react'
import { useProject } from '@/app/context/ProjectContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FileRefrenced from './fileRefrenced'
import MDEditor from '@uiw/react-md-editor'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { saveQuestion } from '@/app/actions/useractions'

const AskQuestion = () => {
  const { currentProject, setCurrentProject } = useProject();
  //used for setting question for asking 
  const [question, setQuestion] = useState("")
  const [queryAnswerLoading, setQueryAnswerLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false);
  //used for showing content in the Dialog box or "Query search"
  const [isopen, setIsopen] = useState(false)
  const [answers, setAnswers] = useState("")
  const [fileRefrenced, setFileRefrenced] = useState([])

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    setAnswers("")
    setFileRefrenced([])
    setQueryAnswerLoading(true);
    try {
      const req = await fetch("/api/queryVectorSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, projectId: currentProject?.projectId })
      })
      if (!req.ok) throw new Error('error getting the summary and files')
      const data = await req.json();
      setAnswers(data.querySummary)
      setFileRefrenced(data.topMatches)
    } catch {

    } finally {
      setQueryAnswerLoading(false)
    }
    setIsopen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      const response = await saveQuestion({
        projectId: currentProject?.projectId,
        question,
        answers,
        fileRefrenced,
      })
      if (response.success) {
        alert("Question saved successfully!")
      } else {
        alert(response.message || "Failed to save question")
      }
    } catch {
      console.error(err)
      alert("Something went wrong")
    }finally{
      setSaveLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isopen} onOpenChange={setIsopen}>
        <DialogContent className="max-h-[90vh] min-w-[80vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className='w-full justify-between'>
                Opsy
                <Button variant={'outline'} onClick={handleSave}> <Save /> Save Answer</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <MDEditor.Markdown source={answers} className='max-h-[40vh] overflow-y-scroll !bg-white !text-black' />
          <div className="h-4"></div>
          <FileRefrenced fileRefrenced={fileRefrenced} />
        </DialogContent>
      </Dialog>
      <Card className='col-span-3 shadow-xl transition-transform duration-300 hover:scale-[1.03]'>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAskQuestion}>
            <Textarea placeholder="Which file should i edit to change the home page?"
              value={question}
              onChange={(e) => { setQuestion(e.target.value) }} />
            <div className="h-4"></div>
            <Button type='submit' disabled={queryAnswerLoading || question.length < 10} className={cn(
              queryAnswerLoading || question.length < 10 ? "cursor-not-allowed" : "cursor-pointer"
            )}>
              {queryAnswerLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {queryAnswerLoading ? "Thinking..." : "Ask Opsy"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestion

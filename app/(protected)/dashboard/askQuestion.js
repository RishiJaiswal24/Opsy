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
import { checkFileCount } from '@/app/actions/checkFileCount'
import { StartProcessingUI } from './StartProcessingUI'
import { ProcessingUI } from './processingUI'
import { saveQuestion } from '@/app/actions/useractions'
import { ToastContainer, toast } from 'react-toastify'
import { Bounce } from 'react-toastify'

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

  const [fileCount, setFileCount] = useState(0)
  const [processingStatus, setProcessingStatus] = useState(null)

  useEffect(() => {
    async function init() {
      if (!currentProject?.projectId) return;

      const values = await checkFileCount(currentProject.projectId);

      if (values.error) {
        console.error(values.error);
        return;
      }

      setFileCount(values.fileCount);
      setProcessingStatus(values.status);
    }

    init();
  }, [currentProject?.projectId]);

  // Interval polling
  useEffect(() => {
    if (!currentProject?.projectId) return;
    if (processingStatus === "completed") return;

    const interval = setInterval(async () => {
      const values = await checkFileCount(currentProject.projectId);

      if (values.error) {
        console.error(values.error);
        return;
      }

      setFileCount(values.fileCount);
      setProcessingStatus(values.status);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentProject?.projectId, processingStatus]);

  //laad the and using RAG
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
        toast.success("Question saved successfully!", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } else {
        toast.error(response.message || "Failed to save question", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    } catch {
      console.error(err)
      toast.error('Something went wrong', {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setSaveLoading(false)
    }
  }

  if (!currentProject?.projectId) {
  return (
    <Card className="col-span-3 shadow-xl p-6 flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold">No Project Selected</h2>

      <p className="text-gray-500 mt-3">
        Please select a project to start asking questions.
      </p>

      <p className="text-gray-400 mt-2 text-sm">
        You can select a project from the sidebar.
      </p>
    </Card>
  );
}

  if (processingStatus === null) {
    return <Card className="col-span-3 shadow-xl p-6 flex flex-col items-center text-center animate-pulse">

      <h2 className="text-xl font-semibold text-gray-400">
        Loading...
      </h2>

      <p className="text-gray-300 mt-3">
        Please wait, we are checking your project details.
      </p>

      <p className="text-gray-400 font-medium mt-3">
        Required Credits : <span className="font-bold">...</span>
        <br />
        Your Credits : <span className="font-bold">...</span>
      </p>

      <div className="h-10 w-32 bg-gray-300 rounded-md mt-6"></div>
    </Card>

  }

  if (processingStatus === "not_started") {
    return <StartProcessingUI fileCount={fileCount} />
  }

  if (processingStatus === "processing") {
    return <ProcessingUI fileCount={fileCount} />
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

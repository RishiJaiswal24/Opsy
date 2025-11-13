

"use client"
import React, { useEffect, useState } from 'react'
import AskQuestion from '../dashboard/askQuestion'
import { fetchSavedQuestion } from '@/app/actions/useractions';
import { useProject } from '@/app/context/ProjectContext';
import { Sheet, SheetContent, SheetHeader, SheetTrigger,SheetTitle } from '@/components/ui/sheet';
import MDEditor from '@uiw/react-md-editor';
import FileRefrenced from '../dashboard/fileRefrenced';

const Page = () => {
  const [questionLog, setQuestionLog] = useState([])
  const { currentProject, setCurrentProject } = useProject();
  const [questionIndex, setQuestionIndex] = useState(0)
  const question = questionLog?.[questionIndex]
  useEffect(() => {
    console.log("Updated question log:", questionLog);
  }, [questionLog]);

  useEffect(() => {
    if (!currentProject?.projectId) return;
    const syncQuestionLog = async () => {
      try {
        const res = await fetch("/api/fetch-saved-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: currentProject.projectId }),
        });
        const data = await res.json();
        setQuestionLog(data);
      } catch (error) {
        console.error("Error syncing question log:", error);
      }
    };

    setQuestionLog([]);
    syncQuestionLog();
  }, [currentProject?.projectId]);

  return (
    <>
      <Sheet>
        <div className='sm:w-3/4'>
          <AskQuestion />
        </div>
        <div className="h-4"></div>
        <h1 className='font-medium text-xl'>Saved Question</h1>
        {/* <div className="h-4"></div> */}
        <div className='flex flex-col gap-2'>
          {questionLog.map((question, index) => {
            return <div  key={question.questionId}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className='flex items-center gap-4 cursor-pointer bg-white rounded-lg p-4 shadow-.xl border transition-transform duration-300 hover:scale-[1.02]'>
                  <div className='text-left flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                        {question.question}
                      </p>
                      <span className='text-xs text-gray-400 whitespace-nowrap'>
                        {new Date(question.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className='text-gray-500 line-clamp-1 text-sm'>{question.answers}</p>
                  </div>
                </div>
              </SheetTrigger>
            </div>
          })}
        </div>
        {question &&  (
          <SheetContent className="overflow-y-scroll sm:max-w-[80vw]">
              <SheetHeader>
                <SheetTitle className='text-2xl underline'>
                  {question.question}
                </SheetTitle >
                <MDEditor.Markdown className='overflow-y-scroll' source={question.answers}/>
                <FileRefrenced fileRefrenced={question.fileRefrenced}/>
              </SheetHeader>
          </SheetContent>
        )}
      </Sheet>
    </>
  )
}
export default Page

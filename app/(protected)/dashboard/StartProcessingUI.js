"use client";
import { ToastContainer, toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { fetchUserCredits } from "@/app/actions/useractions";
import { useProject } from "@/app/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const StartProcessingUI = ({ fileCount }) => {
  const { currentProject, setCurrentProject } = useProject();
  const [credits, setCredits] = useState(null);

  const showCredits = async () => {
    const data = await fetchUserCredits();
    if (data.success) {
      setCredits(data.credits);
    } else {
      toast.error("Failed to load credits: " + data.error, {
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
  };

  useEffect(() => {
    showCredits();
  }, []);

  return (
    <>
      <Card className="col-span-3 shadow-xl p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-[1.03]">
        <h2 className="text-xl font-semibold">Process your GitHub Repository</h2>

        <p className="text-gray-500 mt-3">
          Before asking questions, we need to analyze your codebase.
        </p>

        <p className="text-gray-700 font-medium">
          Required Credits : <span className="font-bold">{fileCount}</span>
          <br />
          Your Credits:{" "}
          <span className="font-bold">{credits !== null ? credits : "..."}</span>
        </p>

        <Button
          className="mt-5 w-fit"
          onClick={async () => {
            const res = await fetch("/api/process-project", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: currentProject?.projectId })
            });

            const data = await res.json();

            if (!data.success) {
              toast.error(data.error, {
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
              return;
            }
            toast.error("Processing started!", {
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
          }}
        >
          Start Processing
        </Button>

      </Card>
    </>
  );
};

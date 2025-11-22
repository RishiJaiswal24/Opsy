"use client"

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const ProcessingUI = ({ fileCount }) => {
  return (
    <Card className="col-span-3 shadow-xl p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-[1.03]">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4">Processing your repository…</p>
      <p className="text-sm text-gray-500">This can take 5 to 10 minutes</p>
    </Card>
  );
};

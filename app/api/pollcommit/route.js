import { pollCommits } from "../github/route";

export async function POST(req){
    try{
        const {projectId}=await req.json()
        if(!projectId){
            return new Response("No Project Found in pollcommits")
        }
        const result=await pollCommits(projectId);
        return new Response("Polling completed!")
    }catch(err){
        console.error("error polling commits",err);
        return ;
    }
}
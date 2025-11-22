"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { createProject } from '@/app/actions/useractions'
import { ToastContainer, toast } from 'react-toastify'
import { Bounce } from 'react-toastify'

const CreatePage = () => {
    const [form, setForm] = useState({
        ProjectName: "",
        GithubRepo: "",
        GithubToken: ""
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await createProject({
                ProjectName: form.ProjectName,
                GithubRepo: form.GithubRepo,
                GithubToken: form.GithubToken
            })

            if (response.success) {
                toast.success('Project created successfully!', {
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
                setForm({ ProjectName: "", GithubRepo: "", GithubToken: "" })
            } else {
                toast.error(response.message || "Failed to create project", {
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
        } catch (err) {
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
            setLoading(false)
            setTimeout(() => {
                window.location.reload()
            }, 1000);
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <div className='h-full flex gap-12 items-center justify-center'>
                <img src="/github.jpeg" className='md:block hidden h-56 w-auto' alt="github" />
                <div>
                    <h1 className='font-semibold text-2xl'>Share your Github...</h1>
                    <p>Share the details to Opsy for creating the project</p>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="h-2"></div>
                            <Input
                                type="text"
                                placeholder='Project name'
                                value={form.ProjectName}
                                onChange={(e) => setForm({ ...form, ProjectName: e.target.value })}
                                required
                            />
                            <div className="h-2"></div>
                            <Input
                                type="url"
                                placeholder='Repo Link'
                                value={form.GithubRepo}
                                onChange={(e) => setForm({ ...form, GithubRepo: e.target.value })}
                                required
                            />
                            <div className="h-2"></div>
                            <Input
                                type="text"
                                placeholder='Github Token (For Private Repo)'
                                value={form.GithubToken}
                                onChange={(e) => setForm({ ...form, GithubToken: e.target.value })}
                            />
                            <div className="h-4"></div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={`cursor-pointer ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                            >Create Project</Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreatePage

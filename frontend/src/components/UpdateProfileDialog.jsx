import React, { useState, useEffect, useRef } from 'react'
import {  DialogFooter } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button';
import { Loader2, X } from 'lucide-react';  // Import X icon for close button
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

function UpdateProfileForm({ open, setOpen }) {
    const [loading, setLoading] = useState(false);

    const { user } = useSelector(store => store.auth);
    const formRef = useRef(null);

    const [input, setInput] = useState({
        fullname: user?.fullname,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.map(skill => skill) || "",
        file: user?.profile?.resume
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname)
        formData.append("email", input.email)
        formData.append("phoneNumber", input.phoneNumber)
        formData.append("bio", input.bio)
        formData.append("skills", input.skills)
        if (input.file) {
            formData.append("file", input.file)
        }
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials: true
            })
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
        setOpen(false);  // Close form after submission
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file })
    }

    // Close the form when clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    if (!open) return null;  // Return nothing if form is closed

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
            <div ref={formRef} className='bg-white p-6 rounded-md shadow-md sm:max-w-[425px]'>
                <div className="flex justify-between items-center">
                    <h1 className='font-bold text-xl'>Update profile</h1>
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4 font-bold" /> {/* Cancel (X) icon */}
                    </Button>
                </div>
                <form onSubmit={submitHandler}>
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="name" className='text-right'>Name</Label>
                            <Input
                                id='name'
                                name="fullname"
                                type="text"
                                value={input.fullname}
                                onChange={changeEventHandler}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="email" className='text-right'>Email</Label>
                            <Input
                                id='email'
                                name="email"
                                type="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="number" className='text-right'>Number</Label>
                            <Input
                                id='number'
                                name="phoneNumber"
                                type="tel"
                                value={input.phoneNumber}
                                onChange={changeEventHandler}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="bio" className='text-right'>Bio</Label>
                            <Input
                                id='bio'
                                name="bio"
                                value={input.bio}
                                type="text"
                                onChange={changeEventHandler}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="skills" className='text-right'>Skills</Label>
                            <Input
                                id='skills'
                                name="skills"
                                value={input.skills}
                                onChange={changeEventHandler}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor="file" className='text-right'>Resume</Label>
                            <Input
                                id='file'
                                name="file"
                                type="file"
                                onChange={fileChangeHandler}
                                accept="application/pdf"
                                className='col-span-3'
                            />
                        </div>
                    </div>
                        {
                            loading
                                ? <Button className='w-full my-4'><Loader2 className='mr-2 animate-spin h-4 w-4' />Please Wait</Button>
                                : <Button type='submit' className='w-full my-4'>Update</Button>
                        }
                </form>
            </div>
        </div>
    )
}

export default UpdateProfileForm;

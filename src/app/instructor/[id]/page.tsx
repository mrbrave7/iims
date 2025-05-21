"use client"
import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    PiFacebookLogo,
    PiLinkedinLogo,
    PiTwitterLogo,
    PiInstagramLogo,
    PiCertificate,
    PiBriefcase,
    PiStar,
    PiUser,
    PiSpinnerGap,
    PiTrash,
    PiPlus,
    PiUpload,
    PiLink,
    PiWarning,
    PiBookOpenText
} from "react-icons/pi"
import { useAdminContext } from "@/app/Context/AdminProvider"
import { Types } from "mongoose"
import { CiEdit } from "react-icons/ci"
import { usePopupContext } from "@/app/Context/ToastProvider"

interface PageProps {
    params: {
        id: string
    }
}

interface Instructor {
    fullName: string
    dateOfBirth: string
    avatarUrl: string
    ShortBio: string
    socialMediaAccounts: { siteName: string; siteUrl: string }[]
    certifications: string[]
    experiences: string[]
    specialization: string[]
    _id: Types.ObjectId
}

interface Certification {
    certificationTitle: string
    issuedOrganization: string
    issuedDate: string
    durationOfTrainingInWeeks: number
    specialMessage: string
    recipientName: string
    certificateId?: string
    certificationScore?: number
    certificateFileUrl?: string
}

interface Experience {
    workedOrganization: string
    role: string
    workDurationInMonths: number
    organizationJoiningDate: string
    organizationLeaveDate: string
    workDescription: string
}

interface SocialMedia {
    siteName: string
    siteUrl: string
}

const constants = {
    MAX_SHORT_TEXT_LENGTH: 100,
    MAX_TEXT_LENGTH: 1000
}

const socialIcons: Record<string, React.ReactNode> = {
    facebook: <PiFacebookLogo size={20} />,
    linkedin: <PiLinkedinLogo size={20} />,
    twitter: <PiTwitterLogo size={20} />,
    instagram: <PiInstagramLogo size={20} />
}

export default function InstructorProfilePage({ params }: PageProps): React.ReactElement {
    const [instructor, setInstructor] = useState<Instructor | null>(null)
    const [loading, setLoading] = useState(true)
    const { Popup } = usePopupContext()
    const toast = Popup()
    const [error, setError] = useState<string | null>(null)
    const { admin } = useAdminContext()
    const [showUpdateImageIcon, setShowUpdateImageIcon] = useState<boolean>(false)
    const [certifications, setCertifications] = useState<Certification[]>([])
    const [experiences, setExperiences] = useState<Experience[]>([])
    const { id } = React.use(params)
    const [showAddExperienceForms, setShowAddExperienceForm] = useState(false)
    const [showAddCertificationForm, setShowAddCertificationForm] = useState(false)
    const [showAddSpecializationform, setShowAddSpecializationForm] = useState(false)
    const [showChangeAvatarUrl, setShowchangeAvatarUrl] = useState(false)
    const [showAddPersonalDetailForm, setShowAddPersonalDetailForm] = useState(false)
    const [showAddSocialMediaLinks, setShowAddSocialMediaLinks] = useState(false)
    const [newAvatarUrl, setNewAvatarUrl] = useState("")
    const [newAvatarUrlError, setNewAvatarUrlError] = useState("")
    const [newSpecialization, setNewSpecialization] = useState("")
    const [instructorBasicDetails, setInstructorBasicDetails] = useState({
        fullName: instructor?.fullName || "",
        shortBio: instructor?.ShortBio || ""
    })
    const [instructorBasicDetailsError, setInstructorBasicDetailsError] = useState({
        fullName: "",
        shortBio: ""
    })
    const [newCertification, setNewCertification] = useState<Certification>({
        certificationTitle: "",
        issuedOrganization: "",
        issuedDate: new Date().toISOString(),
        durationOfTrainingInWeeks: 0,
        specialMessage: "",
        recipientName: "",
        certificateId: "",
        certificationScore: 0,
        certificateFileUrl: ""
    })
    const [newExperience, setNewExperience] = useState<Experience>({
        workedOrganization: "",
        role: "",
        workDurationInMonths: 0,
        organizationJoiningDate: new Date().toISOString(),
        organizationLeaveDate: new Date().toISOString(),
        workDescription: "",
    })
    const [newSocialMedia, setNewSocialMedia] = useState<SocialMedia>({
        siteName: "",
        siteUrl: ""
    })
    const [errors, setErrors] = useState<{
        certification?: Partial<Certification>
        experience?: Partial<Experience>
        socialMedia?: Partial<SocialMedia>
    }>({})

    const fetchInstructor = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/instructor/${id}`)
            if (!response.ok) {
                throw new Error("Failed to fetch instructor")
            }
            const data = await response.json()
            setInstructor(data.profile)
            setInstructorBasicDetails({
                fullName: data.profile.fullName,
                shortBio: data.profile.ShortBio
            })
        } catch (error: any) {
            setError(error.message || "Failed to load instructor data")
        } finally {
            setLoading(false)
        }
    }, [id])

    async function fetchCertifications() {
        if (!instructor?.certifications?.length) {
            setCertifications([])
            return
        }

        try {
            const certificationPromises = instructor.certifications.map(async (certId) => {
                const response = await fetch(`/api/instructor/certifications/${certId}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch certification ${certId}`)
                }
                const { certification } = await response.json()
                return certification
            })

            const allCertifications = await Promise.all(certificationPromises)
            setCertifications(allCertifications.filter(cert => cert !== undefined))
        } catch (error) {
            console.error("Error fetching certifications:", error)
            setCertifications([])
        }
    }

    async function fetchExperiences() {
        if (!instructor?.experiences?.length) {
            setExperiences([])
            return
        }

        try {
            const experiencePromises = instructor.experiences.map(async (expId) => {
                const response = await fetch(`/api/instructor/experiences/${expId}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch experience ${expId}`)
                }
                const {experience}= await response.json()

                return experience
            })

            const allExperiences = await Promise.all(experiencePromises.filter(exp => exp !== undefined))
            setExperiences(allExperiences)
        } catch (error) {
            console.error("Error fetching experiences:", error)
            setExperiences([])
        }
    }


    const handleUpdateBasicDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (!instructorBasicDetails.fullName || instructorBasicDetails.fullName.trim().length < 4) {
                setInstructorBasicDetailsError(prev => ({ ...prev, fullName: "Please provide a valid full name (minimum 4 characters)" }))
                return
            }
            if (!instructorBasicDetails.shortBio || instructorBasicDetails.shortBio.trim().length < 20) {
                setInstructorBasicDetailsError(prev => ({ ...prev, shortBio: "Please provide a valid short bio (minimum 20 characters)" }))
                return
            }

            const response = await fetch(`/api/instructor/update/basicDetails/${instructor?._id}`, {
                credentials: "include",
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(instructorBasicDetails)
            })

            if (!response.ok) {
                throw new Error("Failed to update basic details")
            }

            const { fullName, ShortBio } = await response.json()
            setInstructor(prev => prev ? ({
                ...prev,
                fullName,
                ShortBio
            }) : null)
            setShowAddPersonalDetailForm(false)
            toast.success("Your basic details are updated successfully")
        } catch (error) {
            toast.error("Failed to update your basic details")
            setShowAddPersonalDetailForm(false)
        } finally {
            setInstructorBasicDetailsError({ fullName: "", shortBio: "" })
        }
    }

    const handleUpdateAvatar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (!newAvatarUrl) {
                setNewAvatarUrlError("Please provide a valid URL")
                return
            }

            const response = await fetch(`/api/instructor/update/avatar/${instructor?._id}`, {
                credentials: "include",
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ avatarUrl: newAvatarUrl })
            })

            if (!response.ok) {
                throw new Error("Failed to update avatar")
            }

            const { avatarUrl } = await response.json()
            setInstructor(prev => prev ? ({
                ...prev,
                avatarUrl
            }) : null)
            setNewAvatarUrl("")
            setShowchangeAvatarUrl(false)
            toast.success("Profile picture updated successfully")
        } catch (error) {
            toast.error("Failed to update avatar URL")
            setNewAvatarUrl("")
            setShowchangeAvatarUrl(false)
        } finally {
            setNewAvatarUrlError("")
        }
    }

    const handleAddCertification = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const certErrors: Partial<Certification> = {}

        if (!newCertification.recipientName) certErrors.recipientName = "Recipient name is required"
        if (!newCertification.certificationTitle) certErrors.certificationTitle = "Certification title is required"
        if (!newCertification.issuedOrganization) certErrors.issuedOrganization = "Issuing organization is required"
        if (!newCertification.issuedDate) certErrors.issuedDate = "Issued date is required"
        if (newCertification.certificateFileUrl && !isValidUrl(newCertification.certificateFileUrl)) {
            certErrors.certificateFileUrl = "Invalid URL format"
        }

        if (Object.keys(certErrors).length > 0) {
            setErrors(prev => ({ ...prev, certification: certErrors }))
            return
        }

        try {
            const response = await fetch(`/api/instructor/certifications/${instructor?._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ newCertification })
            })

            if (!response.ok) {
                throw new Error("Failed to add certification")
            }
            const { certificateId } = await response.json()

            setInstructor((prev: any) => ({
                ...prev, certifications: [...prev?.certifications, certificateId]
            }))

            // await fetchCertifications()
            setNewCertification({
                certificationTitle: "",
                issuedOrganization: "",
                issuedDate: new Date().toISOString(),
                durationOfTrainingInWeeks: 0,
                specialMessage: "",
                recipientName: "",
                certificateId: "",
                certificationScore: 0,
                certificateFileUrl: ""
            })
            setShowAddCertificationForm(false)
            toast.success("Certification added successfully")
        } catch (error) {
            toast.error("Failed to add certification")
        }
    }

    const handleAddExperience = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const expErrors: Partial<Experience> = {}

        if (!newExperience.role) expErrors.role = "Role is required"
        if (!newExperience.workedOrganization) expErrors.workedOrganization = "Organization is required"
        if (!newExperience.organizationJoiningDate) expErrors.organizationJoiningDate = "Start date is required"
        if (!newExperience.workDescription) expErrors.workDescription = "Description is required"

        if (Object.keys(expErrors).length > 0) {
            setErrors(prev => ({ ...prev, experience: expErrors }))
            return
        }

        try {
            const response = await fetch(`/api/instructor/experiences/${instructor?._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials:"include",
                body: JSON.stringify({newExperience})
            })

            if (!response.ok) {
                throw new Error("Failed to add experience")
            }
            const {experienceId} = await response.json()
            setInstructor((prev:any) =>({
                ...prev,
                experiences:[...prev?.experiences,experienceId]
            }))
            setNewExperience({
                workedOrganization: "",
                role: "",
                workDurationInMonths: 0,
                organizationJoiningDate: new Date().toISOString(),
                organizationLeaveDate: new Date().toISOString(),
                workDescription: "",
            })
            setShowAddExperienceForm(false)
            toast.success("Experience added successfully")
        } catch (error) {
            toast.error("Failed to add experience")
        }
    }

    const handleAddSpecialization = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (!newSpecialization.trim()) {
            toast.error("Please enter a specialization")
            return
        }

        try {
            const response = await fetch(`/api/instructor/specialization/${instructor?._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ specialization: [...(instructor?.specialization || []), newSpecialization] })
            })

            if (!response.ok) {
                throw new Error("Failed to add specialization")
            }

            setInstructor(prev => prev ? ({
                ...prev,
                specialization: [...prev.specialization, newSpecialization]
            }) : null)
            setNewSpecialization("")
            setShowAddSpecializationForm(false)
            toast.success("Specialization added successfully")
        } catch (error) {
            toast.error("Failed to add specialization")
        }
    }

    const handleAddSocialMedia = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const socialErrors: Partial<SocialMedia> = {}

        if (!newSocialMedia.siteName) socialErrors.siteName = "Platform name is required"
        if (!newSocialMedia.siteUrl || !isValidUrl(newSocialMedia.siteUrl)) {
            socialErrors.siteUrl = "Valid URL is required"
        }

        if (Object.keys(socialErrors).length > 0) {
            setErrors(prev => ({ ...prev, socialMedia: socialErrors }))
            return
        }

        try {
            const response = await fetch(`/api/instructor/social-media/${instructor?._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    socialMediaAccounts: [...(instructor?.socialMediaAccounts || []), newSocialMedia]
                })
            })

            if (!response.ok) {
                throw new Error("Failed to add social media account")
            }

            setInstructor(prev => prev ? ({
                ...prev,
                socialMediaAccounts: [...prev.socialMediaAccounts, newSocialMedia]
            }) : null)
            setNewSocialMedia({ siteName: "", siteUrl: "" })
            setShowAddSocialMediaLinks(false)
            toast.success("Social media account added successfully")
        } catch (error) {
            toast.error("Failed to add social media account")
        }
    }

    const handleRemoveCertification = async (cert: any) => {
        try {
            const response = await fetch(`/api/instructor/certifications/${instructor?._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ certificateId: cert._id })
            })

            if (!response.ok) {
                throw new Error("Failed to remove certification")
            }
            const newCertifications = instructor?.certifications.filter((certificate) => certificate !== cert._id)
            setInstructor((prev: any) => ({
                ...prev,
                certifications: newCertifications
            }))

            toast.success("Certification removed successfully")
        } catch (error) {
            toast.error("Failed to remove certification")
        }
    }

    const handleRemoveExperience = async (exp: any) => {
        try {
            const response = await fetch(`/api/instructor/experiences/${instructor?._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ experienceId: exp?._id })
            })

            if (!response.ok) {
                throw new Error("Failed to remove experience")
            }
            const newExperiences = instructor?.experiences.filter((e) => e !== exp._id)
            setInstructor((prev: any) => ({
                ...prev,
                experiences: newExperiences
            }))
            toast.success("Experience removed successfully")
        } catch (error) {
            toast.error("Failed to remove experience")
        }
    }

    const handleRemoveSpecialization = async (index: number) => {
        try {
            const newSpecializations = [...(instructor?.specialization || [])]
            newSpecializations.splice(index, 1)

            const response = await fetch(`/api/instructor/specialization/${instructor?._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ index })
            })

            if (!response.ok) {
                throw new Error("Failed to remove specialization")
            }

            setInstructor(prev => prev ? ({
                ...prev,
                specialization: newSpecializations
            }) : null)
            toast.success("Specialization removed successfully")
        } catch (error) {
            toast.error("Failed to remove specialization")
        }
    }

    const handleRemoveSocialMedia = async (index: number) => {
        try {
            const newSocialMediaAccounts = [...(instructor?.socialMediaAccounts || [])]
            newSocialMediaAccounts.splice(index, 1)

            const response = await fetch(`/api/instructor/social-media/${instructor?._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ index })
            })

            if (!response.ok) {
                throw new Error("Failed to remove social media account")
            }

            setInstructor(prev => prev ? ({
                ...prev,
                socialMediaAccounts: newSocialMediaAccounts
            }) : null)
            toast.success("Social media account removed successfully")
        } catch (error) {
            toast.error("Failed to remove social media account")
        }
    }

    const handleCertificationIssuedDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCertification(prev => ({
            ...prev,
            issuedDate: new Date(e.target.value).toISOString()
        }))
    }

    const handleExperienceStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewExperience(prev => ({
            ...prev,
            organizationJoiningDate: new Date(e.target.value).toISOString()
        }))
    }

    const handleExperienceEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewExperience(prev => ({
            ...prev,
            organizationLeaveDate: new Date(e.target.value).toISOString()
        }))
    }

    const isValidUrl = (url: string) => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    useEffect(() => {
        fetchInstructor()
    }, [fetchInstructor])

    useEffect(() => {
        if (instructor) {
            fetchCertifications()
            fetchExperiences()
        }
    }, [instructor])

    if (loading) {
        return (
            <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <PiSpinnerGap className="w-full h-full text-orange-500 dark:text-orange-400 animate-spin" />
                        <div className="absolute inset-4 flex items-center justify-center">
                            <PiUser className="text-orange-500 dark:text-orange-400 text-2xl" />
                        </div>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300">Loading instructor data...</p>
                    <div className="flex justify-center gap-2">
                        {[0, 0.2, 0.4].map((delay) => (
                            <span
                                key={delay}
                                className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${delay}s` }}
                            ></span>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error || !instructor) {
        return (
            <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
                <div className="bg-stone-100 dark:bg-stone-800 border-l-4 border-orange-500 dark:border-orange-400 p-4">
                    <div className="flex items-center gap-3">
                        <PiCertificate className="text-orange-500 dark:text-orange-400" size={20} />
                        <p className="text-stone-700 dark:text-stone-200">{error || "Instructor not found"}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-20 flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
            <div className="flex flex-col md:flex-row gap-8 max-w-7xl w-full">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6 sticky top-8">
                        <div className="flex flex-col items-center text-center relative">
                            {admin?.profile_details === instructor?._id && (
                                <div className="absolute top-0 right-0">
                                    <button
                                        onClick={() => setShowAddPersonalDetailForm(true)}
                                        className="flex items-center gap-2  rounded font-bold text-xs"
                                        aria-label="Edit personal details"
                                    >
                                        <CiEdit className="text-3xl text-orange-600" />
                                    </button>
                                </div>
                            )}
                            <div
                                onMouseEnter={() => admin?.profile_details === instructor?._id && setShowUpdateImageIcon(true)}
                                onMouseLeave={() => setShowUpdateImageIcon(false)}
                                className="relative mb-4"
                            >
                                <Image
                                    src={instructor.avatarUrl}
                                    alt={instructor.fullName}
                                    width={160}
                                    height={160}
                                    className="rounded-full object-cover aspect-square border-4 border-stone-100 dark:border-stone-700 shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.src = "/default-avatar.jpg"
                                    }}
                                />
                                {showUpdateImageIcon && admin?.profile_details === instructor?._id && (
                                    <button
                                        onClick={() => setShowchangeAvatarUrl(true)}
                                        className="absolute h-40 flex items-center justify-center w-40 top-0 left-0 rounded-full bg-orange-900/50"
                                        aria-label="Update avatar"
                                    >
                                        <PiUpload className="text-3xl cursor-pointer text-orange-600" />
                                    </button>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{instructor.fullName}</h1>
                            <p className="text-stone-600 dark:text-stone-300 mt-2">{instructor.ShortBio}</p>

                            {/* Social Links */}
                            {instructor?.socialMediaAccounts.length > 0 && (
                                <div className="flex gap-3 mt-4">
                                    {instructor.socialMediaAccounts.map((account, index) => (
                                        <Link
                                            key={index}
                                            href={account.siteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-stone-500 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                            aria-label={account.siteName}
                                        >
                                            {socialIcons[account.siteName.toLowerCase()] || <PiCertificate size={18} />}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {admin?.profile_details === instructor?._id && (
                                <button
                                    onClick={() => setShowAddSocialMediaLinks(true)}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded font-bold text-xs bg-orange-600 text-white"
                                    aria-label="Add social media account"
                                >
                                    <PiPlus /> Add Social Media
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-2/3 lg:w-3/4 space-y-8">
                    {/* Specializations */}
                    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6">
                        <div className="flex align-center justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <PiStar className="text-orange-500 dark:text-orange-400" size={20} />
                                <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Expertise</h2>
                            </div>
                            {admin?.profile_details === instructor?._id && (
                                <button
                                    onClick={() => setShowAddSpecializationForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded font-bold text-xs bg-orange-600 text-white"
                                    aria-label="Add specialization"
                                >
                                    <PiPlus /> <span>Add</span>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {instructor.specialization.map((spec, index) => (
                                <div
                                    key={index}
                                    className="inline-flex items-center px-3 gap-4 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                                >
                                    <span>{spec}</span>
                                    {admin?.profile_details === instructor?._id && (
                                        <div className="flex items-center text-orange-600">
                                            <button
                                                onClick={() => handleRemoveSpecialization(index)}
                                                aria-label={`Remove ${spec} specialization`}
                                            >
                                                <PiTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <PiBriefcase className="text-orange-500 dark:text-orange-400" size={20} />
                                <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Professional Experience</h2>
                            </div>
                            {admin?.profile_details === instructor?._id && (
                                <button
                                    onClick={() => setShowAddExperienceForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded font-bold text-xs bg-orange-600 text-white"
                                    aria-label="Add experience"
                                >
                                    <PiPlus /> <span>Add</span>
                                </button>
                            )}
                        </div>
                        <div className="space-y-6">
                            {experiences.length > 0 ? (
                                experiences.map((exp, index) => (
                                    <div
                                        key={index}
                                        className="relative pl-6 pb-6 border-l-2 border-stone-200 dark:border-stone-600 last:pb-0 last:border-l-0 group"
                                    >
                                        {admin?.profile_details === instructor?._id && (
                                            <div className="flex absolute bottom-2 items-center text-orange-600 justify-between gap-4 right-2">
                                                <button
                                                    onClick={() => handleRemoveExperience(exp)}
                                                    aria-label={`Remove ${exp.role} experience`}
                                                >
                                                    <PiTrash />
                                                </button>
                                            </div>
                                        )}
                                        <div className="absolute w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full -left-[7px] top-1 group-hover:bg-orange-600 dark:group-hover:bg-orange-300 transition-colors"></div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                                            <h3 className="text-lg font-medium text-stone-800 dark:text-stone-100">{exp.role}</h3>
                                            <span className="text-sm text-stone-500 dark:text-stone-400">
                                                {new Date(exp.organizationJoiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                                                {new Date(exp.organizationLeaveDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-stone-700 dark:text-stone-200 font-medium">{exp.workedOrganization}</p>
                                        <p className="text-stone-600 dark:text-stone-300 mt-2">{exp.workDescription}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-stone-600 dark:text-stone-300">No experiences available.</p>
                            )}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-600 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <PiCertificate className="text-orange-500 dark:text-orange-400" size={20} />
                                <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Certifications</h2>
                            </div>
                            {admin?.profile_details === instructor?._id && (
                                <button
                                    onClick={() => setShowAddCertificationForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded font-bold text-xs bg-orange-600 text-white"
                                    aria-label="Add certification"
                                >
                                    <PiPlus /> <span>Add</span>
                                </button>
                            )}
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {certifications.length > 0 ? (
                                certifications.map((cert, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-4 hover:border-orange-300 dark:hover:border-orange-500 transition-colors border-stone-200 dark:border-stone-600 relative"
                                    >
                                        {admin?.profile_details === instructor?._id && (
                                            <div className="flex absolute top-2 items-center text-orange-600 justify-between gap-4 right-2">
                                                <button
                                                    onClick={() => handleRemoveCertification(cert)}
                                                    aria-label={`Remove ${cert.certificationTitle} certification`}
                                                >
                                                    <PiTrash />
                                                </button>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-medium text-stone-800 dark:text-stone-100">{cert.certificationTitle}</h3>
                                        <p className="text-stone-700 dark:text-stone-200">{cert.issuedOrganization}</p>
                                        <div className="mt-2 text-sm text-stone-500 dark:text-stone-400 space-y-1">
                                            <p>Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                                            <p>Duration: {cert.durationOfTrainingInWeeks} weeks</p>
                                        </div>
                                        {cert.specialMessage && (
                                            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 italic">"{cert.specialMessage}"</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-stone-600 dark:text-stone-300">No certifications available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Certification Form */}
            {showAddCertificationForm && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-6">
                            <div className="p-4">
                                <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-4">Add New Certification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="recipientName" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Recipient Name*
                                        </label>
                                        <input
                                            id="recipientName"
                                            type="text"
                                            value={newCertification.recipientName}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, recipientName: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.certification?.recipientName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="Your name as on certificate"
                                            required
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                            aria-invalid={!!errors.certification?.recipientName}
                                            aria-describedby="cert-recipient-error"
                                        />
                                        {errors.certification?.recipientName && (
                                            <p id="cert-recipient-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.certification.recipientName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="certificationTitle" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Certification Title*
                                        </label>
                                        <input
                                            id="certificationTitle"
                                            type="text"
                                            value={newCertification.certificationTitle}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, certificationTitle: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.certification?.certificationTitle ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="e.g., Certified React Developer"
                                            required
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                            aria-invalid={!!errors.certification?.certificationTitle}
                                            aria-describedby="cert-title-error"
                                        />
                                        {errors.certification?.certificationTitle && (
                                            <p id="cert-title-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.certification.certificationTitle}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="issuedOrganization" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Issuing Organization*
                                        </label>
                                        <input
                                            id="issuedOrganization"
                                            type="text"
                                            value={newCertification.issuedOrganization}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, issuedOrganization: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.certification?.issuedOrganization ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="Organization that issued the certificate"
                                            required
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                            aria-invalid={!!errors.certification?.issuedOrganization}
                                            aria-describedby="cert-org-error"
                                        />
                                        {errors.certification?.issuedOrganization && (
                                            <p id="cert-org-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.certification.issuedOrganization}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="certificateId" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Certificate ID
                                        </label>
                                        <input
                                            id="certificateId"
                                            type="text"
                                            value={newCertification.certificateId || ""}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, certificateId: e.target.value }))}
                                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Certificate identification number"
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="durationOfTrainingInWeeks" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Duration (weeks)
                                        </label>
                                        <input
                                            id="durationOfTrainingInWeeks"
                                            type="number"
                                            min="0"
                                            value={newCertification.durationOfTrainingInWeeks}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, durationOfTrainingInWeeks: parseInt(e.target.value) || 0 }))}
                                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Duration of training program"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="certificationScore" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Score/Grade
                                        </label>
                                        <input
                                            id="certificationScore"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={newCertification.certificationScore || ""}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, certificationScore: parseFloat(e.target.value) || 0 }))}
                                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Your score/grade if applicable"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="certificateFileUrl" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Certificate File URL
                                        </label>
                                        <input
                                            id="certificateFileUrl"
                                            type="url"
                                            value={newCertification.certificateFileUrl || ""}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, certificateFileUrl: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.certification?.certificateFileUrl ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="URL to view/download certificate"
                                            aria-invalid={!!errors.certification?.certificateFileUrl}
                                            aria-describedby="cert-url-error"
                                        />
                                        {errors.certification?.certificateFileUrl && (
                                            <p id="cert-url-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.certification.certificateFileUrl}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="issuedDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Issued Date*
                                        </label>
                                        <input
                                            id="issuedDate"
                                            type="date"
                                            required
                                            value={new Date(newCertification.issuedDate).toISOString().split("T")[0]}
                                            onChange={handleCertificationIssuedDate}
                                            className={`w-full rounded-lg border ${errors.certification?.issuedDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            aria-invalid={!!errors.certification?.issuedDate}
                                            aria-describedby="cert-date-error"
                                        />
                                        {errors.certification?.issuedDate && (
                                            <p id="cert-date-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.certification.issuedDate}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="specialMessage" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Special Message
                                        </label>
                                        <textarea
                                            id="specialMessage"
                                            value={newCertification.specialMessage}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, specialMessage: e.target.value }))}
                                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px]"
                                            placeholder="Any special message or note about this certification"
                                            maxLength={constants.MAX_TEXT_LENGTH}
                                        />
                                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            {newCertification.specialMessage.length}/{constants.MAX_TEXT_LENGTH} characters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-colors"
                                        onClick={() => setShowAddCertificationForm(false)}
                                        aria-label="Cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                        onClick={handleAddCertification}
                                        disabled={!newCertification.recipientName || !newCertification.certificationTitle || !newCertification.issuedOrganization || !newCertification.issuedDate}
                                        aria-label="Add certification"
                                    >
                                        Add Certification
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Experience Form */}
            {showAddExperienceForms && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-6">
                            <div className="p-4">
                                <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-4">Add New Experience</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Role/Position*
                                        </label>
                                        <input
                                            id="role"
                                            type="text"
                                            value={newExperience.role}
                                            onChange={(e) => setNewExperience(prev => ({ ...prev, role: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.experience?.role ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="e.g., Senior Developer"
                                            required
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                            aria-invalid={!!errors.experience?.role}
                                            aria-describedby="exp-role-error"
                                        />
                                        {errors.experience?.role && (
                                            <p id="exp-role-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.experience.role}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="workedOrganization" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Organization*
                                        </label>
                                        <input
                                            id="workedOrganization"
                                            type="text"
                                            value={newExperience.workedOrganization}
                                            onChange={(e) => setNewExperience(prev => ({ ...prev, workedOrganization: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.experience?.workedOrganization ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            placeholder="Company/organization name"
                                            required
                                            maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                            aria-invalid={!!errors.experience?.workedOrganization}
                                            aria-describedby="exp-org-error"
                                        />
                                        {errors.experience?.workedOrganization && (
                                            <p id="exp-org-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.experience.workedOrganization}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="organizationJoiningDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Start Date*
                                        </label>
                                        <input
                                            id="organizationJoiningDate"
                                            type="date"
                                            value={new Date(newExperience.organizationJoiningDate).toISOString().split("T")[0]}
                                            onChange={handleExperienceStartDate}
                                            className={`w-full rounded-lg border ${errors.experience?.organizationJoiningDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            required
                                            aria-invalid={!!errors.experience?.organizationJoiningDate}
                                            aria-describedby="exp-start-error"
                                        />
                                        {errors.experience?.organizationJoiningDate && (
                                            <p id="exp-start-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.experience.organizationJoiningDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="organizationLeaveDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            id="organizationLeaveDate"
                                            type="date"
                                            value={new Date(newExperience.organizationLeaveDate).toISOString().split("T")[0]}
                                            onChange={handleExperienceEndDate}
                                            className={`w-full rounded-lg border ${errors.experience?.organizationLeaveDate ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                            aria-invalid={!!errors.experience?.organizationLeaveDate}
                                            aria-describedby="exp-end-error"
                                        />
                                        {errors.experience?.organizationLeaveDate && (
                                            <p id="exp-end-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.experience.organizationLeaveDate}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="workDurationInMonths" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Duration (months)
                                        </label>
                                        <input
                                            id="workDurationInMonths"
                                            type="number"
                                            min="0"
                                            value={newExperience.workDurationInMonths}
                                            onChange={(e) => setNewExperience(prev => ({ ...prev, workDurationInMonths: parseInt(e.target.value) || 0 }))}
                                            className="w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Duration in months"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="workDescription" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                            Description*
                                        </label>
                                        <textarea
                                            id="workDescription"
                                            value={newExperience.workDescription}
                                            onChange={(e) => setNewExperience(prev => ({ ...prev, workDescription: e.target.value }))}
                                            className={`w-full rounded-lg border ${errors.experience?.workDescription ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                                            placeholder="Describe your role and responsibilities"
                                            required
                                            maxLength={constants.MAX_TEXT_LENGTH}
                                            aria-invalid={!!errors.experience?.workDescription}
                                            aria-describedby="exp-desc-error"
                                        />
                                        {errors.experience?.workDescription && (
                                            <p id="exp-desc-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <PiWarning size={16} /> {errors.experience.workDescription}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            {newExperience.workDescription.length}/{constants.MAX_TEXT_LENGTH} characters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-colors"
                                        onClick={() => setShowAddExperienceForm(false)}
                                        aria-label="Cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                        onClick={handleAddExperience}
                                        disabled={!newExperience.role || !newExperience.workedOrganization || !newExperience.organizationJoiningDate || !newExperience.workDescription}
                                        aria-label="Add experience"
                                    >
                                        Add Experience
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Personal Details Form */}
            {showAddPersonalDetailForm && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form
                        onSubmit={handleUpdateBasicDetails}
                        className="flex items-center bg-stone-100 dark:bg-stone-800 w-full max-w-2xl flex-col gap-6 p-12 rounded-xl"
                    >
                        <h1 className="text-3xl text-orange-600 font-bold">Update Your Personal Details</h1>
                        <div className="space-y-1 w-full">
                            <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                Full Name*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PiUser className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={instructorBasicDetails.fullName}
                                    onChange={(e) => setInstructorBasicDetails(prev => ({ ...prev, fullName: e.target.value }))}
                                    className={`pl-10 w-full rounded-lg border ${instructorBasicDetailsError.fullName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                    placeholder="Enter your full name"
                                    aria-invalid={!!instructorBasicDetailsError.fullName}
                                    aria-describedby="name-error"
                                    required
                                />
                            </div>
                            {instructorBasicDetailsError.fullName && (
                                <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {instructorBasicDetailsError.fullName}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1 w-full">
                            <label htmlFor="shortBio" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                Short Bio*
                            </label>
                            <textarea
                                id="shortBio"
                                name="shortBio"
                                value={instructorBasicDetails.shortBio}
                                onChange={(e) => setInstructorBasicDetails(prev => ({ ...prev, shortBio: e.target.value }))}
                                className={`w-full rounded-lg border ${instructorBasicDetailsError.shortBio ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px]`}
                                placeholder="Tell us about yourself (e.g., your teaching philosophy, background)"
                                aria-invalid={!!instructorBasicDetailsError.shortBio}
                                aria-describedby="bio-error"
                                required
                            />
                            {instructorBasicDetailsError.shortBio && (
                                <p id="bio-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {instructorBasicDetailsError.shortBio}
                                </p>
                            )}
                        </div>
                        <div className="flex w-full gap-4">
                            <button
                                type="button"
                                className="w-full p-2 text-white rounded font-bold cursor-pointer bg-stone-500 hover:bg-stone-600"
                                onClick={() => setShowAddPersonalDetailForm(false)}
                                aria-label="Cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full p-2 text-white rounded font-bold cursor-pointer bg-orange-600 hover:bg-orange-700"
                                aria-label="Update personal details"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Specialization Form */}
            {showAddSpecializationform && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl max-w-xl w-full">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300">Add Specialization</h3>
                            <div className="space-y-2">
                                <label htmlFor="specialization" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Specialization
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="specialization"
                                        type="text"
                                        value={newSpecialization}
                                        onChange={(e) => setNewSpecialization(e.target.value)}
                                        className="flex-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Add a specialization (e.g., Web Development, Data Science)"
                                        maxLength={constants.MAX_SHORT_TEXT_LENGTH}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSpecialization}
                                        className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-1"
                                        aria-label="Add specialization"
                                    >
                                        <PiPlus size={16} /> Add
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {instructor.specialization.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full flex items-center gap-2"
                                    >
                                        {spec}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpecialization(index)}
                                            className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                                            aria-label={`Remove ${spec} specialization`}
                                        >
                                            <PiTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-colors"
                                    onClick={() => setShowAddSpecializationForm(false)}
                                    aria-label="Cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Social Media Form */}
            {showAddSocialMediaLinks && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form className="bg-stone-100 dark:bg-stone-800 p-6 rounded-xl max-w-xl w-full">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-stone-700 dark:text-stone-300">Add Social Media Account</h3>
                            <div className="space-y-2">
                                <label htmlFor="siteName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                    Social Media Accounts
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-10 gap-2">
                                    <input
                                        id="siteName"
                                        type="text"
                                        value={newSocialMedia.siteName}
                                        onChange={(e) => setNewSocialMedia(prev => ({ ...prev, siteName: e.target.value }))}
                                        className={`rounded-lg border col-span-2 ${errors.socialMedia?.siteName ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                        placeholder="Platform (e.g. Twitter)"
                                        aria-invalid={!!errors.socialMedia?.siteName}
                                        aria-describedby="social-name-error"
                                    />
                                    <input
                                        type="text"
                                        value={newSocialMedia.siteUrl}
                                        onChange={(e) => setNewSocialMedia(prev => ({ ...prev, siteUrl: e.target.value }))}
                                        className={`rounded-lg border col-span-7 ${errors.socialMedia?.siteUrl ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                        placeholder="Profile URL"
                                        aria-invalid={!!errors.socialMedia?.siteUrl}
                                        aria-describedby="social-url-error"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSocialMedia}
                                        className="px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"
                                        aria-label="Add social media account"
                                    >
                                        <PiPlus size={16} /> Add
                                    </button>
                                </div>
                                {(errors.socialMedia?.siteName || errors.socialMedia?.siteUrl) && (
                                    <div className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <PiWarning size={16} />
                                        {errors.socialMedia?.siteName || errors.socialMedia?.siteUrl}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {instructor.socialMediaAccounts.map((account, index) => (
                                    <div
                                        key={index}
                                        className="bg-stone-100 dark:bg-stone-700 text-orange-600 px-3 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <span className="font-medium">{account.siteName}</span>
                                        <span className="text-stone-600 dark:text-stone-300 truncate max-w-xs">{account.siteUrl}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSocialMedia(index)}
                                            className="text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 ml-auto"
                                            aria-label={`Remove ${account.siteName} account`}
                                        >
                                            <PiTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-colors"
                                    onClick={() => setShowAddSocialMediaLinks(false)}
                                    aria-label="Cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Avatar URL Form */}
            {showChangeAvatarUrl && (
                <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50">
                    <form
                        onSubmit={handleUpdateAvatar}
                        className="flex items-center bg-stone-100 dark:bg-stone-800 w-full max-w-2xl flex-col gap-6 p-12 rounded-xl"
                    >
                        <h1 className="text-3xl text-orange-600 font-bold">Update Profile Picture</h1>
                        <div className="space-y-1 w-full">
                            <label htmlFor="avatarUrl" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                                Avatar URL*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PiLink className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    id="avatarUrl"
                                    name="avatarUrl"
                                    type="url"
                                    value={newAvatarUrl}
                                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                                    className={`pl-10 w-full rounded-lg border ${newAvatarUrlError ? "border-red-500" : "border-stone-300 dark:border-stone-700"} bg-stone-50 dark:bg-stone-800 py-2 px-3 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                                    placeholder="Enter image URL for your avatar"
                                    aria-invalid={!!newAvatarUrlError}
                                    aria-describedby="avatar-error"
                                    required
                                />
                            </div>
                            {newAvatarUrlError && (
                                <p id="avatar-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <PiWarning size={16} /> {newAvatarUrlError}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                Provide a URL to your profile picture (e.g., from Gravatar or other image hosting)
                            </p>
                        </div>
                        <div className="flex w-full gap-4">
                            <button
                                type="button"
                                className="w-full p-2 text-white rounded font-bold cursor-pointer bg-stone-500 hover:bg-stone-600"
                                onClick={() => setShowchangeAvatarUrl(false)}
                                aria-label="Cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full p-2 text-white rounded font-bold cursor-pointer bg-orange-600 hover:bg-orange-700"
                                aria-label="Update avatar"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
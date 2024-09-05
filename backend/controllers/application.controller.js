import { Application } from '../models/applications.model.js'
import { Job } from '../models/job.model.js'
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job Id is required",
                success: false
            })
        }
        //check if user already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You Have already Applied for this Job",
                success: false
            })
        }
        // check if the job exists;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job Not found",
                success: false
            })
        }
        //creating application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId
        })
        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message: "Job Applied Successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: "job",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } }
            }
        });
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        }
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}
//admin dekhega kitne user ne apply kia hai
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "applicant"
            }
        })
        if (!job) {
            return res.status(404).json({
                message: "Job Not Found",
                success: false
            })
        }
        return res.status(200).json({
            job,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: "Status is Required",
                success: false
            })
        }
        //find the application by applicant Id
        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application Not Found",
                success: false
            })
        }
        //update status
        application.status = status.toLowerCase();
        await application.save();
        return res.status(200).json({
            message: "Status Updated Successfully",
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}
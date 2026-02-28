import mongoose from 'mongoose'

const ResetTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // 1 hour TTL
})

const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', ResetTokenSchema)
export default ResetToken

// importing dependencies
const mongoose = require('mongoose');

// creating product schema to be stored in db
const subscriberSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    accessKey: String,
    id: String,
    page_id: String,
    user_refs: [],
    status: String,
    first_name: String,
    last_name: String,
    name: String,
    gender: String,
    profile_pic: String,
    locale: String,
    language: String,
    timezone: String,
    live_chat_url: String,
    last_input_text: String,
    optin_phone: Boolean,
    phone: String,
    optin_email: Boolean,
    email: String,
    subscribed: String,
    last_interaction: String,
    last_seen: String,
    is_followup_enabled: Boolean,
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    }
},
    { strict: false },
    { timestamps: true }
)

// exporting schema
module.exports = mongoose.model('Subscriber', subscriberSchema);
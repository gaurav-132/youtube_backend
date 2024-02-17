const Contact = require('../models/contactModel');

const contactForm = async (req, res) => {
    try{
        await Contact.create(req.body);

        return res.status(200).json({ message : "Message Send Successfully" });
    }catch(err){    
        return res.status(500).json({ message : err.message });
    }
}

module.exports = { contactForm };
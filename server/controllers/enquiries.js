// Enquiries Controller - Customer contact form submissions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEnquiry(req, res) {
  try {
    const { name, phone, interest, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }
    const enquiry = await prisma.enquiry.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        interest: (interest || 'General').trim(),
        message: (message || '').trim(),
      },
    });
    return res.status(201).json({ success: true, id: enquiry.id });
  } catch (err) {
    console.error('Enquiry create error:', err);
    return res.status(500).json({ error: 'Failed to save enquiry.' });
  }
}

async function getAllEnquiries(req, res) {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(enquiries);
  } catch (err) {
    console.error('Enquiries GET error:', err);
    return res.status(500).json({ error: 'Failed to load enquiries.' });
  }
}

async function deleteEnquiry(req, res) {
  try {
    const { id } = req.params;
    await prisma.enquiry.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Enquiry delete error:', err);
    return res.status(500).json({ error: 'Failed to delete enquiry.' });
  }
}

module.exports = { createEnquiry, getAllEnquiries, deleteEnquiry };

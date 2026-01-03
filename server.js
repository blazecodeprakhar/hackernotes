const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve files from 'public' folder

// 1. Connect to MongoDB
// We use 127.0.0.1 instead of localhost to avoid connection issues on some systems
const mongoUrl = 'mongodb://127.0.0.1:27017/studentDB';

mongoose.connect(mongoUrl)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// 2. Define a Schema (Structure of our data)
const noteSchema = new mongoose.Schema({
    title: String,
    content: String
});

// 3. Create a Model (The tool we use to interact with the database)
const Note = mongoose.model('Note', noteSchema);

// 4. Routes (API endpoints)

// GET request: Fetch all notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find(); // Find all documents in the 'notes' collection
        res.json(notes); // Send them back to the frontend
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// POST request: Add a new note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        const newNote = new Note({ title, content });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: 'Error saving note' });
    }
});

// DELETE request: Delete a note by ID
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Note.findByIdAndDelete(id);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

// 5. Vault Schemas & Models
const vaultConfigSchema = new mongoose.Schema({
    passcode: String, // Simple text for student project
    securityQuestion: String,
    securityAnswer: String
});
const VaultConfig = mongoose.model('VaultConfig', vaultConfigSchema);

const privateNoteSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});
const PrivateNote = mongoose.model('PrivateNote', privateNoteSchema);

// 6. Vault Routes

// Check if vault is set up
app.get('/api/vault/status', async (req, res) => {
    const config = await VaultConfig.findOne();
    res.json({ isSetup: !!config });
});

// Setup Vault
app.post('/api/vault/setup', async (req, res) => {
    try {
        const { passcode, securityQuestion, securityAnswer } = req.body;
        // Clear existing config if any (single user system)
        await VaultConfig.deleteMany({});

        const newConfig = new VaultConfig({ passcode, securityQuestion, securityAnswer });
        await newConfig.save();
        res.json({ message: 'Vault Securely Configured' });
    } catch (err) {
        res.status(500).json({ error: 'Setup Failed' });
    }
});

// Verify Passcode
app.post('/api/vault/verify', async (req, res) => {
    const { passcode } = req.body;
    const config = await VaultConfig.findOne();
    if (config && config.passcode === passcode) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Get Security Question (for reset)
app.get('/api/vault/security-question', async (req, res) => {
    const config = await VaultConfig.findOne();
    if (config) {
        res.json({ question: config.securityQuestion });
    } else {
        res.status(404).json({ error: 'Vault not setup' });
    }
});

// Reset Password
app.post('/api/vault/reset', async (req, res) => {
    const { answer, newPasscode } = req.body;
    const config = await VaultConfig.findOne();

    if (config && config.securityAnswer.toLowerCase() === answer.toLowerCase()) {
        config.passcode = newPasscode;
        await config.save();
        res.json({ success: true, message: 'Passcode Reset Successful' });
    } else {
        res.json({ success: false, message: 'Security Answer Incorrect' });
    }
});

// Get Private Notes
app.get('/api/vault/notes', async (req, res) => {
    // In a real app, check auth token here.
    // For this simple project, checking is done on frontend or prior request.
    const notes = await PrivateNote.find();
    res.json(notes);
});

// Add Private Note
app.post('/api/vault/notes', async (req, res) => {
    const { title, content } = req.body;
    const newNote = new PrivateNote({ title, content });
    await newNote.save();
    res.json(newNote);
});

// Delete Private Note
app.delete('/api/vault/notes/:id', async (req, res) => {
    try {
        await PrivateNote.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

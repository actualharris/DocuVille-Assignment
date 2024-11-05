import express from "express";
import axios from "axios";
import Tesseract from "tesseract.js";
import cors from "cors"; 

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/extract', async (req, res) => {
    const { imageUrl } = req.body;

    try {
        // download image as a buffer instead of storing on disk
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // Tesseract for OCR
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');

        console.log("Extracted Text:", text);

        // cleaning/pre-processsing extracted text
        const cleanedText = text.replace(/\s+/g, ' ').trim();

        // extracting name, document number, and expiration date from text
    
        const documentIdMatch = cleanedText.match(/\$\s*([0-9]+)/);
        const documentId = documentIdMatch ? documentIdMatch[1] : null;

        const nameMatch = cleanedText.match(/Given Names\/Prénoms Arr ER\s*.*?\\\s*([A-Z\s]+)/i);
        const name = nameMatch ? nameMatch[1].trim() : null;

        const expirationDateMatch = cleanedText.match(/(\d{1,2})\s+(AUG\/AOUT)\s+(\d{2})/i);
        const expirationDate = expirationDateMatch ? `${expirationDateMatch[1]} ${expirationDateMatch[2]} ${expirationDateMatch[3]}` : null;

        
        // console.log("Document ID:", documentId);
        // console.log("Name:", name);
        // console.log("Expiration Date:", expirationDate);

        // send json response with extracted data
        if (name || documentId || expirationDate) {
            res.json({ name, documentId, expirationDate });
        } else {
            res.status(404).send('No recognizable data found');
        }
    } catch (error) {
        console.error('Error in data extraction:', error);
        res.status(500).send('Error extracting data');
    }
});

app.listen(port, () => {
    console.log(`Listening at ${port}`);
});
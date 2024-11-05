// For Driver's License

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

        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');

        
        console.log("Extracted Text:", text);

        // extracting name, document number, and expiration date from text
        
        
        const cleanedText = text.replace(/\s+/g, ' ');
        console.log("Cleaned Extracted Text:", cleanedText);

        // const name = text.match(/Name\s*(.+)/i)?.[1];
        
        const documentId = cleanedText.match(/(?:ID:|=\s*0:)\s*([0-9-]+)/i)?.[1];
        const name = cleanedText.match(/\|\s*([A-Za-z\s]+)/i)?.[1];
        const expirationDate = text.match(/Exp(?:iry|iration)?:\s*(.+)/i)?.[1];

   

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
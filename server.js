const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
}); 

app.post('/generate-mawb', async (req, res) => {
    try {
        const {
            awbNumber,
            shipperName,
            consigneeName,
            carrierCode,
            grossWeight,
            dimensions,
            departure,
            destination,
            handlingInformation,
            prepaid,
            totalChargesCarrier,
            date,
            place,
            signature
        } = req.body;

        // Load the PDF template
        const templatePath = path.join(__dirname, 'templates', '427506089-Modelo-Air-way-Bill.pdf');
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Get the first page
        const page = pdfDoc.getPages()[0];

        // Embed fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

       // Helper function for text drawing with more precise control
const drawText = (text, x, y, options = {}) => {
    const {
        font = helveticaFont,
        size = 10,
        color = rgb(0, 0, 0),
        align = 'left'
    } = options;

    page.drawText(text.toString(), {
        x,
        y,
        size,
        font,
        color,
        align
    });
};

// AWB Numbers (typically appears in the top section)
drawText('176-73317996', 105, 770, { size: 10, font: helveticaBold });
drawText('176-73317996', 505, 770, { size: 10, font: helveticaBold });

// Shipper Section (upper left box)
drawText('SAUDI ARABIAN OIL COMPANY ( ARAMCO )', 65, 760, { size: 6 });
drawText('MATERIAL SUPPORT SECTION', 65, 750, { size: 6 });
drawText('AVIATION DEPARTMENT', 65, 740, { size: 6 });
drawText('SAUDI ARABIA', 65, 730, { size: 8 });
drawText('PHONE : +966138775333', 65, 720, { size: 6 });

// Consignee Section (middle left box)
drawText('DEXTRANS WORLDWIDE KOREA CO., LTD.', 65, 645, { size: 8 });
drawText('RM 2201, 90, CENTUMJUNGANG-RO,', 65, 635, { size: 8 });
drawText('HAEUNDAE-GU, BUSAN, 48059, KOREA', 65, 625, { size: 8 });
drawText('TEL: +827088311566, BRN: 6728602689', 65, 615, { size: 8 });
drawText('EMAIL: GWEN.CHO@DEXTRANSGROUP.COM', 65, 605, { size: 8 });

// Carrier and Route Information
drawText('EK', 200, 565, { size: 9 });
drawText('DMM – SAUDI ARABIA', 65, 525, { size: 8 });
drawText('ICN – SOUTH KOREA', 285, 525, { size: 8 });

// Weight and Dimensions (center section)
drawText('10', 48, 385, { size: 9 });  // Number of pieces
drawText('7171.00', 95, 385, { size: 9 });  // Weight
drawText('120 X 120 X 107 @ 10', 285, 385, { size: 8 });  // Dimensions

// Handling Information
drawText('DANGEROUS GOODS AS PER ASSOCIATED', 65, 325, { size: 8 });
drawText("SHIPPER'S DECLARATION", 65, 315, { size: 8 });

// Charges (bottom section)
drawText('40000.00', 285, 245, { size: 9 });  // Weight charge
drawText('40000.00', 485, 245, { size: 9 });  // Total charge

// Bottom Section
drawText('03/11/2024', 65, 125, { size: 8 });  // Date
drawText('DMM', 180, 125, { size: 8 });  // Place
drawText('SMSA EXPRESS TRANSPORTATION CO., LTD', 285, 125, { size: 8 });

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(__dirname, 'generated', `MAWB_${Date.now()}.pdf`);
        
        // Ensure the generated directory exists
        if (!fs.existsSync(path.join(__dirname, 'generated'))) {
            fs.mkdirSync(path.join(__dirname, 'generated'));
        }

        // Write the PDF file
        fs.writeFileSync(outputPath, pdfBytes);

        // Send the PDF as a download
        res.download(outputPath, `MAWB_176-73317996.pdf`, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
            // Clean up: delete the file after download
            fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error('Error generating MAWB:', error);
        res.status(500).send('Error generating MAWB');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
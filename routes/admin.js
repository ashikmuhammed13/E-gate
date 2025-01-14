const express = require('express');
const router = express.Router();
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const normalAwb = require('../controller/normalAwb');
// const postalCodeService = require('../services/postalCodeService');

router.get("/createAwb",normalAwb.getAwbPage)
router.post("/createAwb",normalAwb.createAwb)

// router.get('/api/postal-lookup/:country/:postalCode', async (req, res) => {
//     const { country, postalCode } = req.params;
//     const result = await postalCodeService.lookup(country, postalCode);
//     res.json(result);
// });



// Route to serve the form.html (GET request)
router.get('/', (req, res) => {
    res.render("admin/form")
});

// Route to handle the PDF generation from form submission (POST request)
router.post('/generate-mawb', async (req, res) => {
    try {
        // Destructuring the form data from the request body
        const { awbNumber, shipperName, consigneeName, carrierCode, grossWeight, dimensions, departure, destination, handlingInformation, prepaid, totalChargesCarrier, date, place, signature } = req.body;

        // Load the PDF template
        const templatePath = path.join(__dirname, 'templates', '427506089-Modelo-Air-way-Bill.pdf');
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Get the first page of the template PDF
        const page = pdfDoc.getPages()[0];

        // Embed fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Helper function to draw text on the PDF with customization
        const drawText = (text, x, y, options = {}) => {
            const { font = helveticaFont, size = 10, color = rgb(0, 0, 0), align = 'left' } = options;
            page.drawText(text.toString(), { x, y, size, font, color, align });
        };

        // Draw Shipper's Name and Address (Purple Box)
        drawText('SAUDI ARABIAN OIL COMPANY ( ARAMCO )', 65, 760, { size: 8 });
        drawText('MATERIAL SUPPORT SECTION', 65, 748, { size: 8 });
        drawText('AVIATION DEPARTMENT', 65, 736, { size: 8 });
        drawText('SAUDI ARABIA', 65, 724, { size: 8 });
        drawText('PHONE : +966138775333', 65, 712, { size: 8 });

        // Draw Consignee's Name and Address (Pink Box)
        drawText('DEXTRANS WORLDWIDE KOREA CO., LTD.', 65, 680, { size: 8 });
        drawText('RM 2201, 90, CENTUMJUNGANG-RO,', 65, 668, { size: 8 });
        drawText('HAEUNDAE-GU, BUSAN, 48059, KOREA', 65, 656, { size: 8 });
        drawText('TEL: +827088311566, BRN: 6728602689', 65, 644, { size: 8 });
        drawText('EMAIL: GWEN.CHO@DEXTRANSGROUP.COM', 65, 632, { size: 8 });

        // Draw Issuing Carrier's Agent (Mint Green Box)
        drawText('SMSA EXPRESS TRANSPORTATION CO., LTD', 65, 600, { size: 8 });

        // Draw Airport of Departure (Yellow Box)
        drawText('DMM – SAUDI ARABIA', 65, 560, { size: 8 });
        drawText('4564654', 65, 450, { size: 8 });
        drawText('DXB', 65, 430, { size: 8 });

        // Draw Airport of Destination (Red Box)
        drawText('ICN – SOUTH KOREA', 65, 410, { size: 8 });

        // Draw Cargo Details
        const cargoY = 460;  // Starting Y position for cargo section
        drawText('DANGEROUS GOODS AS PER ASSOCIATED', 90, cargoY, { size: 9 });
        drawText("SHIPPER'S DECLARATION", 90, cargoY - 12, { size: 9 });
        drawText('10', 90, cargoY - 30, { size: 9 });
        drawText('7171.00 KG', 120, cargoY - 30, { size: 9 });
        drawText('7171.00', 250, cargoY - 30, { size: 9 });
        drawText('5.57', 350, cargoY - 30, { size: 9 });
        drawText('40000.00', 450, cargoY - 30, { size: 9 });
        drawText('CONSOLIDATED', 90, cargoY - 45, { size: 9 });
        drawText('DIM 120 X 120 X 107 @ 10', 90, cargoY - 60, { size: 9 });

        // Draw Bottom Section
        const bottomY = 200;  // Starting Y position for bottom section
        drawText('FREIGHT PREPAID', 270, 510, { size: 8 });
        drawText('ORIGINAL 3 (FOR SHIPPER)', 90, bottomY - 15, { size: 9 });
        drawText('7145089', 90, bottomY - 30, { size: 9 });

        // Draw Final Line
        const finalY = 150;  // Starting Y position for final line
        drawText('03/11/2024', 90, finalY, { size: 9 });
        drawText('DMM', 170, finalY, { size: 9 });
        drawText('SMSA EXPRESS TRANSPORTATION CO., LTD', 250, finalY, { size: 9 });

        // Draw Charges at bottom
        drawText('40000.00', 450, finalY - 20, { size: 9 });
        drawText('40000.00', 450, finalY - 35, { size: 9 });

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

module.exports = router;

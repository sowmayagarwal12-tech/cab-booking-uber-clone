package com.cab.booking.service;

import com.cab.booking.entity.Payment;
import com.cab.booking.entity.Ride;
import com.cab.booking.repository.PaymentRepository;
import com.cab.booking.repository.RideRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class PdfInvoiceService {

    private final RideRepository rideRepository;
    private final PaymentRepository paymentRepository;

    public PdfInvoiceService(RideRepository rideRepository, PaymentRepository paymentRepository) {
        this.rideRepository = rideRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateRideInvoicePdf(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Optional<Payment> paymentOpt = paymentRepository.findByRideId(rideId);

        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(0, 0, 0));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 100, 100));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(39, 110, 241));

            // Header Banner
            Paragraph brand = new Paragraph("🚖 UBER TAXI ENTERPRISE", titleFont);
            brand.setAlignment(Element.ALIGN_LEFT);
            document.add(brand);

            Paragraph docType = new Paragraph("OFFICIAL TRIP INVOICE & RECEIPT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(39, 110, 241)));
            document.add(docType);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            String dateStr = ride.getCreatedAt() != null ? ride.getCreatedAt().format(formatter) : "N/A";
            Paragraph metadata = new Paragraph("Invoice #: INV-" + ride.getId() + " | Date: " + dateStr + " | Status: " + ride.getStatus(), subTitleFont);
            metadata.setSpacingAfter(15);
            document.add(metadata);

            // Divider
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell divCell = new PdfPCell(new Phrase(""));
            divCell.setBorder(Rectangle.BOTTOM);
            divCell.setBorderColor(new Color(220, 220, 220));
            divCell.setPaddingBottom(5);
            divider.addCell(divCell);
            document.add(divider);

            // Rider and Driver info section
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(15);
            infoTable.setSpacingAfter(15);

            PdfPCell riderCell = new PdfPCell();
            riderCell.setBorder(Rectangle.NO_BORDER);
            riderCell.addElement(new Paragraph("PASSENGER DETAILS", boldBodyFont));
            riderCell.addElement(new Paragraph("Name: " + ride.getRider().getFullName(), bodyFont));
            riderCell.addElement(new Paragraph("Email: " + ride.getRider().getEmail(), bodyFont));
            riderCell.addElement(new Paragraph("Phone: " + (ride.getRider().getPhoneNumber() != null ? ride.getRider().getPhoneNumber() : "N/A"), bodyFont));
            infoTable.addCell(riderCell);

            PdfPCell driverCell = new PdfPCell();
            driverCell.setBorder(Rectangle.NO_BORDER);
            driverCell.addElement(new Paragraph("DRIVER & VEHICLE DETAILS", boldBodyFont));
            if (ride.getDriver() != null) {
                driverCell.addElement(new Paragraph("Driver: " + ride.getDriver().getUser().getFullName(), bodyFont));
                driverCell.addElement(new Paragraph("Vehicle: " + ride.getDriver().getVehicleModel() + " (" + ride.getVehicleType() + ")", bodyFont));
                driverCell.addElement(new Paragraph("Plate No: " + ride.getDriver().getVehicleNumber(), bodyFont));
            } else {
                driverCell.addElement(new Paragraph("Driver: Unassigned", bodyFont));
            }
            infoTable.addCell(driverCell);
            document.add(infoTable);

            // Trip Route
            Paragraph routeHeader = new Paragraph("TRIP ROUTE & DETAILS", boldBodyFont);
            routeHeader.setSpacingAfter(6);
            document.add(routeHeader);

            PdfPTable routeTable = new PdfPTable(2);
            routeTable.setWidthPercentage(100);
            routeTable.setWidths(new float[]{25, 75});

            routeTable.addCell(createCell("Pickup Location:", boldBodyFont, false));
            routeTable.addCell(createCell(ride.getPickupAddress(), bodyFont, false));

            routeTable.addCell(createCell("Drop Location:", boldBodyFont, false));
            routeTable.addCell(createCell(ride.getDropAddress(), bodyFont, false));

            routeTable.addCell(createCell("Distance / Duration:", boldBodyFont, false));
            routeTable.addCell(createCell(ride.getDistanceKm() + " km / " + ride.getDurationMinutes() + " mins", bodyFont, false));

            document.add(routeTable);

            // Fare breakdown table
            Paragraph fareHeader = new Paragraph("FARE BREAKDOWN", boldBodyFont);
            fareHeader.setSpacingBefore(15);
            fareHeader.setSpacingAfter(6);
            document.add(fareHeader);

            PdfPTable fareTable = new PdfPTable(2);
            fareTable.setWidthPercentage(100);
            fareTable.setWidths(new float[]{70, 30});

            PdfPCell h1 = new PdfPCell(new Phrase("Description", headerFont));
            h1.setBackgroundColor(new Color(18, 18, 18));
            h1.setPadding(6);
            PdfPCell h2 = new PdfPCell(new Phrase("Amount (INR)", headerFont));
            h2.setBackgroundColor(new Color(18, 18, 18));
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            h2.setPadding(6);
            fareTable.addCell(h1);
            fareTable.addCell(h2);

            fareTable.addCell(createCell("Base Fare (" + ride.getVehicleType() + ")", bodyFont, true));
            fareTable.addCell(createAmountCell("Rs. " + String.format("%.2f", ride.getBaseFare() != null ? ride.getBaseFare() : 10.0), bodyFont));

            fareTable.addCell(createCell("Distance & Time Charge", bodyFont, true));
            fareTable.addCell(createAmountCell("Rs. " + String.format("%.2f", Math.max(0, ride.getTotalFare() - (ride.getBaseFare() != null ? ride.getBaseFare() : 10.0))), bodyFont));

            if (ride.getSurgeMultiplier() != null && ride.getSurgeMultiplier() > 1.0) {
                fareTable.addCell(createCell("Surge Multiplier", bodyFont, true));
                fareTable.addCell(createAmountCell(ride.getSurgeMultiplier() + "x", bodyFont));
            }

            if (ride.getDiscount() != null && ride.getDiscount() > 0) {
                fareTable.addCell(createCell("Promotion Discount Applied", bodyFont, true));
                fareTable.addCell(createAmountCell("-Rs. " + String.format("%.2f", ride.getDiscount()), bodyFont));
            }

            // Total Cell
            PdfPCell totDesc = new PdfPCell(new Phrase("TOTAL PAID", totalFont));
            totDesc.setPadding(8);
            totDesc.setBackgroundColor(new Color(245, 245, 245));
            PdfPCell totVal = new PdfPCell(new Phrase("Rs. " + String.format("%.2f", ride.getTotalFare()), totalFont));
            totVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totVal.setPadding(8);
            totVal.setBackgroundColor(new Color(245, 245, 245));
            fareTable.addCell(totDesc);
            fareTable.addCell(totVal);

            document.add(fareTable);

            // Payment method details
            if (paymentOpt.isPresent()) {
                Payment p = paymentOpt.get();
                Paragraph payInfo = new Paragraph("Payment Method: " + p.getPaymentMethod() + " | Transaction ID: " + p.getStripePaymentIntentId() + " | Status: " + p.getStatus(), subTitleFont);
                payInfo.setSpacingBefore(10);
                document.add(payInfo);
            }

            // Footer note
            Paragraph footer = new Paragraph("Thank you for riding with us! For questions or lost items, visit our 24/7 Support Desk.", subTitleFont);
            footer.setSpacingBefore(20);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF invoice: " + e.getMessage(), e);
        }
    }

    private PdfPCell createCell(String text, Font font, boolean padded) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        if (padded) cell.setPadding(5);
        cell.setBorderColor(new Color(230, 230, 230));
        return cell;
    }

    private PdfPCell createAmountCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(5);
        cell.setBorderColor(new Color(230, 230, 230));
        return cell;
    }
}

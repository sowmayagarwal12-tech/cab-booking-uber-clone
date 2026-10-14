package com.cab.booking.controller;

import com.cab.booking.dto.RideBookingRequest;
import com.cab.booking.dto.RideEstimateRequest;
import com.cab.booking.dto.RideEstimateResponse;
import com.cab.booking.dto.RideResponse;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.User;
import com.cab.booking.enums.Role;
import com.cab.booking.service.AuthService;
import com.cab.booking.service.DriverService;
import com.cab.booking.service.PdfInvoiceService;
import com.cab.booking.service.RideService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;
    private final AuthService authService;
    private final DriverService driverService;
    private final PdfInvoiceService pdfInvoiceService;

    public RideController(RideService rideService,
                          AuthService authService,
                          DriverService driverService,
                          PdfInvoiceService pdfInvoiceService) {
        this.rideService = rideService;
        this.authService = authService;
        this.driverService = driverService;
        this.pdfInvoiceService = pdfInvoiceService;
    }

    @PostMapping("/estimate")
    public ResponseEntity<RideEstimateResponse> getEstimate(@Valid @RequestBody RideEstimateRequest request) {
        return ResponseEntity.ok(rideService.getEstimate(request));
    }

    @PostMapping("/book")
    public ResponseEntity<RideResponse> bookRide(@Valid @RequestBody RideBookingRequest request) {
        User rider = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(rideService.bookRide(request, rider));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideResponse> getRideById(@PathVariable Long id) {
        return ResponseEntity.ok(rideService.getRideById(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<RideResponse> acceptRide(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        return ResponseEntity.ok(rideService.acceptRide(id, driver.getId()));
    }

    @PostMapping("/{id}/arrived")
    public ResponseEntity<RideResponse> driverArrived(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        return ResponseEntity.ok(rideService.driverArrived(id, driver.getId()));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<RideResponse> startRide(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        String otp = payload.get("otp");
        return ResponseEntity.ok(rideService.startRide(id, otp, driver.getId()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<RideResponse> completeRide(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        return ResponseEntity.ok(rideService.completeRide(id, driver.getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<RideResponse> cancelRide(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        User user = authService.getCurrentAuthenticatedUser();
        String reason = (payload != null && payload.containsKey("reason")) ? payload.get("reason") : "Rider requested cancellation";
        return ResponseEntity.ok(rideService.cancelRide(id, reason, user));
    }

    @GetMapping("/active")
    public ResponseEntity<RideResponse> getActiveRide() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user.getRole() == Role.ROLE_DRIVER) {
            Driver driver = driverService.getDriverByUser(user);
            return rideService.getActiveRideForDriver(driver.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } else {
            return rideService.getActiveRideForUser(user.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        }
    }

    @GetMapping("/rider/history")
    public ResponseEntity<List<RideResponse>> getRiderHistory() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(rideService.getRiderHistory(user.getId()));
    }

    @GetMapping("/driver/history")
    public ResponseEntity<List<RideResponse>> getDriverHistory() {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        return ResponseEntity.ok(rideService.getDriverHistory(driver.getId()));
    }

    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        byte[] pdfBytes = pdfInvoiceService.generateRideInvoicePdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Uber_Invoice_Ride_" + id + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}

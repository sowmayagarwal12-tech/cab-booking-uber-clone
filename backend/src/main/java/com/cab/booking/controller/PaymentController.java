package com.cab.booking.controller;

import com.cab.booking.dto.PaymentRequest;
import com.cab.booking.entity.Payment;
import com.cab.booking.service.StripePaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final StripePaymentService paymentService;

    public PaymentController(StripePaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody Map<String, Long> payload) {
        Long rideId = payload.get("rideId");
        return ResponseEntity.ok(paymentService.createPaymentIntent(rideId));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Payment> confirmPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request));
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<Payment> getPaymentForRide(@PathVariable Long rideId) {
        return ResponseEntity.ok(paymentService.getPaymentByRideId(rideId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        // Stripe webhook listener endpoint
        return ResponseEntity.ok("Webhook received successfully");
    }
}

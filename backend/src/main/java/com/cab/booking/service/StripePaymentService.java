package com.cab.booking.service;

import com.cab.booking.dto.PaymentRequest;
import com.cab.booking.entity.Payment;
import com.cab.booking.entity.Ride;
import com.cab.booking.enums.PaymentMethod;
import com.cab.booking.enums.PaymentStatus;
import com.cab.booking.repository.PaymentRepository;
import com.cab.booking.repository.RideRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentService {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentService.class);

    @Value("${app.stripe.api-key:sk_test_mock_stripe_key_cab_booking_enterprise_platform_sec}")
    private String stripeApiKey;

    @Value("${app.stripe.webhook-secret:whsec_mock_stripe_webhook_cab_booking_signature}")
    private String webhookSecret;

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public StripePaymentService(PaymentRepository paymentRepository,
                                RideRepository rideRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.paymentRepository = paymentRepository;
        this.rideRepository = rideRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = this.stripeApiKey;
    }

    @Transactional
    public Map<String, Object> createPaymentIntent(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        long amountInCents = Math.round(ride.getTotalFare() * 100);
        String clientSecret;
        String paymentIntentId;

        // Check if real Stripe key or fallback mock
        if (stripeApiKey != null && stripeApiKey.startsWith("sk_test_") && !stripeApiKey.contains("mock")) {
            try {
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency("usd")
                        .setDescription("Ride #" + rideId + " Fare Payment")
                        .putMetadata("rideId", String.valueOf(rideId))
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                        )
                        .build();

                PaymentIntent intent = PaymentIntent.create(params);
                clientSecret = intent.getClientSecret();
                paymentIntentId = intent.getId();
            } catch (Exception e) {
                logger.warn("Stripe API call failed, falling back to sandbox simulator mode: {}", e.getMessage());
                paymentIntentId = "pi_sim_" + System.currentTimeMillis();
                clientSecret = paymentIntentId + "_secret_mock";
            }
        } else {
            paymentIntentId = "pi_sim_" + System.currentTimeMillis();
            clientSecret = paymentIntentId + "_secret_mock";
        }

        Payment payment = paymentRepository.findByRideId(rideId)
                .orElse(new Payment(ride, paymentIntentId, ride.getTotalFare(), "USD", PaymentMethod.STRIPE_CARD));

        payment.setStripePaymentIntentId(paymentIntentId);
        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        response.put("paymentIntentId", paymentIntentId);
        response.put("amount", ride.getTotalFare());
        response.put("currency", "USD");
        response.put("rideId", rideId);
        return response;
    }

    @Transactional
    public Payment confirmPayment(PaymentRequest request) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Payment payment = paymentRepository.findByRideId(request.getRideId())
                .orElse(new Payment(ride, "pi_sim_" + System.currentTimeMillis(), ride.getTotalFare(), "USD", request.getPaymentMethod()));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionDate(LocalDateTime.now());
        payment.setReceiptUrl("/api/rides/" + ride.getId() + "/invoice");

        Payment saved = paymentRepository.save(payment);

        // Broadcast payment confirmation to ride topic
        messagingTemplate.convertAndSend("/topic/ride-payment/" + request.getRideId(), saved);

        return saved;
    }

    @Transactional(readOnly = true)
    public Payment getPaymentByRideId(Long rideId) {
        return paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new RuntimeException("Payment not found for ride: " + rideId));
    }
}

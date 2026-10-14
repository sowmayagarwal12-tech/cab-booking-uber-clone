package com.cab.booking.service;

import com.cab.booking.dto.RideBookingRequest;
import com.cab.booking.dto.RideEstimateRequest;
import com.cab.booking.dto.RideEstimateResponse;
import com.cab.booking.dto.RideResponse;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.Payment;
import com.cab.booking.entity.PromoCode;
import com.cab.booking.entity.Ride;
import com.cab.booking.entity.User;
import com.cab.booking.enums.PaymentMethod;
import com.cab.booking.enums.PaymentStatus;
import com.cab.booking.enums.RideStatus;
import com.cab.booking.enums.Role;
import com.cab.booking.repository.DriverRepository;
import com.cab.booking.repository.PaymentRepository;
import com.cab.booking.repository.PromoCodeRepository;
import com.cab.booking.repository.RideRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final PaymentRepository paymentRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final FareCalculatorService fareCalculatorService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureRandom random = new SecureRandom();

    public RideService(RideRepository rideRepository,
                       DriverRepository driverRepository,
                       PaymentRepository paymentRepository,
                       PromoCodeRepository promoCodeRepository,
                       FareCalculatorService fareCalculatorService,
                       SimpMessagingTemplate messagingTemplate) {
        this.rideRepository = rideRepository;
        this.driverRepository = driverRepository;
        this.paymentRepository = paymentRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.fareCalculatorService = fareCalculatorService;
        this.messagingTemplate = messagingTemplate;
    }

    public RideEstimateResponse getEstimate(RideEstimateRequest request) {
        double distanceKm = fareCalculatorService.calculateDistanceKm(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(), request.getDropLng());

        int durationMins = fareCalculatorService.estimateDurationMinutes(distanceKm);
        double surge = fareCalculatorService.getSurgeMultiplier();

        double discount = 0.0;
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            Optional<PromoCode> promo = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getPromoCode().trim());
            if (promo.isPresent()) {
                double rawDiscount = 50.0 * (promo.get().getDiscountPercentage() / 100.0);
                discount = promo.get().getMaxDiscountAmount() != null 
                        ? Math.min(rawDiscount, promo.get().getMaxDiscountAmount()) 
                        : rawDiscount;
            }
        }

        List<RideEstimateResponse.VehicleOption> options = fareCalculatorService.getVehicleOptions(
                distanceKm, durationMins, surge, discount);

        RideEstimateResponse response = new RideEstimateResponse();
        response.setDistanceKm(distanceKm);
        response.setDurationMinutes(durationMins);
        response.setSurgeMultiplier(surge);
        response.setPromoDiscount(discount);
        response.setOptions(options);

        return response;
    }

    @Transactional
    public RideResponse bookRide(RideBookingRequest request, User rider) {
        double distanceKm = fareCalculatorService.calculateDistanceKm(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDropLatitude(), request.getDropLongitude());

        int durationMins = fareCalculatorService.estimateDurationMinutes(distanceKm);
        double surge = fareCalculatorService.getSurgeMultiplier();

        double discount = 0.0;
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            Optional<PromoCode> promo = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getPromoCode().trim());
            if (promo.isPresent()) {
                discount = 20.0; // standard promo discount value
            }
        }

        double totalFare = fareCalculatorService.calculateFare(
                distanceKm, durationMins, request.getVehicleType(), surge, discount);

        // Generate 4-digit numeric OTP
        String otp = String.format("%04d", random.nextInt(9000) + 1000);

        Ride ride = new Ride();
        ride.setRider(rider);
        ride.setPickupAddress(request.getPickupAddress());
        ride.setPickupLatitude(request.getPickupLatitude());
        ride.setPickupLongitude(request.getPickupLongitude());
        ride.setDropAddress(request.getDropAddress());
        ride.setDropLatitude(request.getDropLatitude());
        ride.setDropLongitude(request.getDropLongitude());
        ride.setDistanceKm(distanceKm);
        ride.setDurationMinutes(durationMins);
        ride.setBaseFare(request.getVehicleType().getBaseFare());
        ride.setSurgeMultiplier(surge);
        ride.setDiscount(discount);
        ride.setTotalFare(totalFare);
        ride.setOtp(otp);
        ride.setStatus(RideStatus.REQUESTED);
        ride.setVehicleType(request.getVehicleType());
        ride.setCreatedAt(LocalDateTime.now());

        Ride savedRide = rideRepository.save(ride);
        RideResponse response = toResponse(savedRide);

        // Broadcast to general ride request stream so available drivers get notified
        messagingTemplate.convertAndSend("/topic/ride-requests", response);

        return response;
    }

    @Transactional
    public RideResponse acceptRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RuntimeException("Ride cannot be accepted. Current status is " + ride.getStatus());
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + driverId));

        ride.setDriver(driver);
        ride.setStatus(RideStatus.ACCEPTED);
        ride.setAcceptedAt(LocalDateTime.now());

        driver.setIsAvailable(false);
        driverRepository.save(driver);

        Ride saved = rideRepository.save(ride);
        RideResponse response = toResponse(saved);

        // Broadcast ride update to rider and general topic
        messagingTemplate.convertAndSend("/topic/ride-status/" + rideId, response);
        messagingTemplate.convertAndSend("/topic/ride-accepted", response);

        return response;
    }

    @Transactional
    public RideResponse driverArrived(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        ride.setStatus(RideStatus.DRIVER_ARRIVED);
        ride.setArrivedAt(LocalDateTime.now());

        Ride saved = rideRepository.save(ride);
        RideResponse response = toResponse(saved);

        messagingTemplate.convertAndSend("/topic/ride-status/" + rideId, response);
        return response;
    }

    @Transactional
    public RideResponse startRide(Long rideId, String inputOtp, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getOtp() != null && !ride.getOtp().equals(inputOtp.trim())) {
            throw new RuntimeException("Invalid OTP! Please request the correct 4-digit OTP from the rider.");
        }

        ride.setStatus(RideStatus.IN_PROGRESS);
        ride.setStartedAt(LocalDateTime.now());

        Ride saved = rideRepository.save(ride);
        RideResponse response = toResponse(saved);

        messagingTemplate.convertAndSend("/topic/ride-status/" + rideId, response);
        return response;
    }

    @Transactional
    public RideResponse completeRide(Long rideId, Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        ride.setStatus(RideStatus.COMPLETED);
        ride.setCompletedAt(LocalDateTime.now());

        Driver driver = ride.getDriver();
        if (driver != null) {
            driver.setIsAvailable(true);
            driver.setTotalRides(driver.getTotalRides() + 1);
            driver.setTotalEarnings(driver.getTotalEarnings() + ride.getTotalFare());
            driverRepository.save(driver);
        }

        // Initialize pending payment
        Optional<Payment> existingPayment = paymentRepository.findByRideId(rideId);
        if (existingPayment.isEmpty()) {
            Payment payment = new Payment(
                    ride,
                    "pi_sim_" + System.currentTimeMillis(),
                    ride.getTotalFare(),
                    "USD",
                    PaymentMethod.STRIPE_CARD
            );
            paymentRepository.save(payment);
        }

        Ride saved = rideRepository.save(ride);
        RideResponse response = toResponse(saved);

        messagingTemplate.convertAndSend("/topic/ride-status/" + rideId, response);
        return response;
    }

    @Transactional
    public RideResponse cancelRide(Long rideId, String reason, User user) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed ride");
        }

        ride.setStatus(RideStatus.CANCELLED);
        ride.setCancellationReason(reason);
        ride.setCancelledAt(LocalDateTime.now());

        if (ride.getDriver() != null) {
            Driver driver = ride.getDriver();
            driver.setIsAvailable(true);
            driverRepository.save(driver);
        }

        Ride saved = rideRepository.save(ride);
        RideResponse response = toResponse(saved);

        messagingTemplate.convertAndSend("/topic/ride-status/" + rideId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public RideResponse getRideById(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));
        return toResponse(ride);
    }

    @Transactional(readOnly = true)
    public Optional<RideResponse> getActiveRideForUser(Long userId) {
        List<RideStatus> activeStatuses = Arrays.asList(
                RideStatus.REQUESTED,
                RideStatus.ACCEPTED,
                RideStatus.DRIVER_ARRIVED,
                RideStatus.IN_PROGRESS
        );
        return rideRepository.findFirstByRiderIdAndStatusInOrderByCreatedAtDesc(userId, activeStatuses)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<RideResponse> getActiveRideForDriver(Long driverId) {
        List<RideStatus> activeStatuses = Arrays.asList(
                RideStatus.ACCEPTED,
                RideStatus.DRIVER_ARRIVED,
                RideStatus.IN_PROGRESS
        );
        return rideRepository.findFirstByDriverIdAndStatusInOrderByCreatedAtDesc(driverId, activeStatuses)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<RideResponse> getRiderHistory(Long riderId) {
        return rideRepository.findByRiderIdOrderByCreatedAtDesc(riderId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RideResponse> getDriverHistory(Long driverId) {
        return rideRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RideResponse> getAllRides() {
        return rideRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public RideResponse toResponse(Ride ride) {
        RideResponse res = new RideResponse();
        res.setId(ride.getId());
        res.setRiderId(ride.getRider().getId());
        res.setRiderName(ride.getRider().getFullName());
        res.setRiderPhone(ride.getRider().getPhoneNumber());

        if (ride.getDriver() != null) {
            Driver d = ride.getDriver();
            res.setDriverId(d.getId());
            res.setDriverName(d.getUser().getFullName());
            res.setDriverPhone(d.getUser().getPhoneNumber());
            res.setVehicleModel(d.getVehicleModel());
            res.setVehicleNumber(d.getVehicleNumber());
            res.setDriverRating(d.getRating());
            res.setDriverLat(d.getCurrentLatitude());
            res.setDriverLng(d.getCurrentLongitude());
        }

        res.setPickupAddress(ride.getPickupAddress());
        res.setPickupLatitude(ride.getPickupLatitude());
        res.setPickupLongitude(ride.getPickupLongitude());
        res.setDropAddress(ride.getDropAddress());
        res.setDropLatitude(ride.getDropLatitude());
        res.setDropLongitude(ride.getDropLongitude());
        res.setDistanceKm(ride.getDistanceKm());
        res.setDurationMinutes(ride.getDurationMinutes());
        res.setTotalFare(ride.getTotalFare());
        res.setOtp(ride.getOtp());
        res.setStatus(ride.getStatus());
        res.setVehicleType(ride.getVehicleType());
        res.setCreatedAt(ride.getCreatedAt());
        res.setAcceptedAt(ride.getAcceptedAt());
        res.setArrivedAt(ride.getArrivedAt());
        res.setStartedAt(ride.getStartedAt());
        res.setCompletedAt(ride.getCompletedAt());
        res.setCancelledAt(ride.getCancelledAt());
        res.setCancellationReason(ride.getCancellationReason());

        return res;
    }
}

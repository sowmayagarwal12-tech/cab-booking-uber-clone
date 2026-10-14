package com.cab.booking.service;

import com.cab.booking.dto.AdminMetricsResponse;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.Rating;
import com.cab.booking.entity.Ride;
import com.cab.booking.entity.User;
import com.cab.booking.enums.RideStatus;
import com.cab.booking.enums.Role;
import com.cab.booking.enums.TicketStatus;
import com.cab.booking.enums.UserStatus;
import com.cab.booking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final RatingRepository ratingRepository;
    private final SupportTicketRepository supportTicketRepository;

    public AdminService(UserRepository userRepository,
                        DriverRepository driverRepository,
                        RideRepository rideRepository,
                        RatingRepository ratingRepository,
                        SupportTicketRepository supportTicketRepository) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.rideRepository = rideRepository;
        this.ratingRepository = ratingRepository;
        this.supportTicketRepository = supportTicketRepository;
    }

    @Transactional(readOnly = true)
    public AdminMetricsResponse getPlatformMetrics() {
        List<Ride> allRides = rideRepository.findAll();
        List<Driver> allDrivers = driverRepository.findAll();
        List<User> allRiders = userRepository.findByRole(Role.ROLE_RIDER);
        List<Rating> allRatings = ratingRepository.findAll();

        double totalRevenue = allRides.stream()
                .filter(r -> r.getStatus() == RideStatus.COMPLETED)
                .mapToDouble(r -> r.getTotalFare() != null ? r.getTotalFare() : 0.0)
                .sum();

        long completedRides = allRides.stream()
                .filter(r -> r.getStatus() == RideStatus.COMPLETED)
                .count();

        long activeRides = allRides.stream()
                .filter(r -> r.getStatus() == RideStatus.REQUESTED ||
                             r.getStatus() == RideStatus.ACCEPTED ||
                             r.getStatus() == RideStatus.DRIVER_ARRIVED ||
                             r.getStatus() == RideStatus.IN_PROGRESS)
                .count();

        long activeDriversOnline = allDrivers.stream()
                .filter(Driver::getIsOnline)
                .count();

        double avgRating = allRatings.isEmpty() ? 4.9 :
                allRatings.stream().mapToInt(Rating::getStars).average().orElse(4.9);

        long openTickets = supportTicketRepository.findAll().stream()
                .filter(t -> t.getStatus() == TicketStatus.OPEN)
                .count();

        AdminMetricsResponse res = new AdminMetricsResponse();
        res.setTotalRevenue(FareCalculatorService.round(totalRevenue, 2));
        res.setTotalRides((long) allRides.size());
        res.setCompletedRides(completedRides);
        res.setActiveRides(activeRides);
        res.setTotalDrivers((long) allDrivers.size());
        res.setActiveDriversOnline(activeDriversOnline);
        res.setTotalRiders((long) allRiders.size());
        res.setPlatformRatingAverage(FareCalculatorService.round(avgRating, 2));
        res.setOpenSupportTickets(openTickets);

        return res;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.SUSPENDED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Transactional
    public Driver verifyDriver(Long driverId, boolean isVerified) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setIsVerified(isVerified);
        return driverRepository.save(driver);
    }
}

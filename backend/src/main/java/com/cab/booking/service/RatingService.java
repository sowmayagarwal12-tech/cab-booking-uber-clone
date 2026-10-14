package com.cab.booking.service;

import com.cab.booking.dto.RatingRequest;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.Rating;
import com.cab.booking.entity.Ride;
import com.cab.booking.entity.User;
import com.cab.booking.repository.DriverRepository;
import com.cab.booking.repository.RatingRepository;
import com.cab.booking.repository.RideRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;

    public RatingService(RatingRepository ratingRepository,
                         RideRepository rideRepository,
                         DriverRepository driverRepository) {
        this.ratingRepository = ratingRepository;
        this.rideRepository = rideRepository;
        this.driverRepository = driverRepository;
    }

    @Transactional
    public Rating submitRating(RatingRequest request, User rider) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getDriver() == null) {
            throw new RuntimeException("Cannot rate a ride with no assigned driver");
        }

        Driver driver = ride.getDriver();

        Rating rating = ratingRepository.findByRideId(request.getRideId())
                .orElse(new Rating(ride, rider, driver, request.getStars(), request.getComment(), request.getTags()));

        rating.setStars(request.getStars());
        rating.setComment(request.getComment());
        rating.setTags(request.getTags());

        Rating savedRating = ratingRepository.save(rating);

        // Update driver average score
        int count = driver.getTotalRatingsCount() != null ? driver.getTotalRatingsCount() : 0;
        double currentRating = driver.getRating() != null ? driver.getRating() : 5.0;

        double updatedRating = ((currentRating * count) + request.getStars()) / (count + 1);
        driver.setRating(FareCalculatorService.round(updatedRating, 2));
        driver.setTotalRatingsCount(count + 1);
        driverRepository.save(driver);

        return savedRating;
    }

    @Transactional(readOnly = true)
    public List<Rating> getDriverRatings(Long driverId) {
        return ratingRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }
}

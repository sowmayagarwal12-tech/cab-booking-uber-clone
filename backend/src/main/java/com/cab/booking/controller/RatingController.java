package com.cab.booking.controller;

import com.cab.booking.dto.RatingRequest;
import com.cab.booking.entity.Rating;
import com.cab.booking.entity.User;
import com.cab.booking.service.AuthService;
import com.cab.booking.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;
    private final AuthService authService;

    public RatingController(RatingService ratingService, AuthService authService) {
        this.ratingService = ratingService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Rating> submitRating(@Valid @RequestBody RatingRequest request) {
        User rider = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ratingService.submitRating(request, rider));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Rating>> getDriverRatings(@PathVariable Long driverId) {
        return ResponseEntity.ok(ratingService.getDriverRatings(driverId));
    }
}

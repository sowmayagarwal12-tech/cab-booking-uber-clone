package com.cab.booking.service;

import com.cab.booking.enums.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FareCalculatorServiceTest {

    private FareCalculatorService fareCalculatorService;

    @BeforeEach
    void setUp() {
        fareCalculatorService = new FareCalculatorService();
    }

    @Test
    void testCalculateDistanceKm() {
        // Connaught Place (28.6315, 77.2167) to India Gate (28.6129, 77.2295) ~ 2.4 km
        double distance = fareCalculatorService.calculateDistanceKm(28.6315, 77.2167, 28.6129, 77.2295);
        assertTrue(distance > 1.5 && distance < 3.5, "Distance should be ~2.4 km");
    }

    @Test
    void testCalculateFare() {
        double fare = fareCalculatorService.calculateFare(10.0, 20, VehicleType.ECONOMY, 1.0, 0.0);
        // Base: 10 + Dist: 10*11=110 + Time: 20*1.5=30 => 150.0
        assertEquals(150.0, fare, 0.01);
    }

    @Test
    void testFareWithDiscount() {
        double fare = fareCalculatorService.calculateFare(10.0, 20, VehicleType.ECONOMY, 1.0, 20.0);
        assertEquals(130.0, fare, 0.01);
    }
}

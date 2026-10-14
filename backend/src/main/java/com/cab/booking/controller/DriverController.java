package com.cab.booking.controller;

import com.cab.booking.dto.DriverLocationUpdate;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.User;
import com.cab.booking.service.AuthService;
import com.cab.booking.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;
    private final AuthService authService;

    public DriverController(DriverService driverService, AuthService authService) {
        this.driverService = driverService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Driver> getDriverProfile() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(driverService.getDriverByUser(user));
    }

    @PutMapping("/status")
    public ResponseEntity<Driver> updateOnlineStatus(@RequestBody Map<String, Boolean> payload) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        boolean isOnline = payload.getOrDefault("isOnline", true);
        return ResponseEntity.ok(driverService.toggleOnlineStatus(driver.getId(), isOnline));
    }

    @PutMapping("/location")
    public ResponseEntity<Driver> updateLocation(@RequestBody DriverLocationUpdate update) {
        User user = authService.getCurrentAuthenticatedUser();
        Driver driver = driverService.getDriverByUser(user);
        return ResponseEntity.ok(driverService.updateLocation(driver.getId(), update));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Driver>> getNearbyDrivers(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "15.0") double radiusKm) {
        return ResponseEntity.ok(driverService.findNearbyAvailableDrivers(lat, lng, radiusKm));
    }

    @GetMapping("/online")
    public ResponseEntity<List<Driver>> getOnlineDrivers() {
        return ResponseEntity.ok(driverService.getAllOnlineDrivers());
    }
}

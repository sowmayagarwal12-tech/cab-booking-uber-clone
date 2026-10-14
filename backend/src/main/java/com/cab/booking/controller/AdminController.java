package com.cab.booking.controller;

import com.cab.booking.dto.AdminMetricsResponse;
import com.cab.booking.dto.RideResponse;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.SupportTicket;
import com.cab.booking.entity.User;
import com.cab.booking.service.AdminService;
import com.cab.booking.service.RideService;
import com.cab.booking.service.SupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final RideService rideService;
    private final SupportService supportService;

    public AdminController(AdminService adminService,
                           RideService rideService,
                           SupportService supportService) {
        this.adminService = adminService;
        this.rideService = rideService;
        this.supportService = supportService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getMetrics() {
        return ResponseEntity.ok(adminService.getPlatformMetrics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PutMapping("/drivers/{id}/verify")
    public ResponseEntity<Driver> verifyDriver(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        boolean isVerified = payload.getOrDefault("isVerified", true);
        return ResponseEntity.ok(adminService.verifyDriver(id, isVerified));
    }

    @GetMapping("/rides")
    public ResponseEntity<List<RideResponse>> getAllRides() {
        return ResponseEntity.ok(rideService.getAllRides());
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }

    @PutMapping("/tickets/{id}/resolve")
    public ResponseEntity<SupportTicket> resolveTicket(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload.getOrDefault("notes", "Resolved by Admin");
        return ResponseEntity.ok(supportService.resolveTicket(id, notes));
    }
}

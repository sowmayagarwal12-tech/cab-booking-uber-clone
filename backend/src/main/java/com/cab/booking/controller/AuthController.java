package com.cab.booking.controller;

import com.cab.booking.dto.AuthRequest;
import com.cab.booking.dto.AuthResponse;
import com.cab.booking.dto.RegisterRequest;
import com.cab.booking.entity.User;
import com.cab.booking.enums.Role;
import com.cab.booking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentAuthenticatedUser());
    }

    @PostMapping("/demo-login/{role}")
    public ResponseEntity<AuthResponse> demoLogin(@PathVariable String role) {
        String email;
        String password = role.equalsIgnoreCase("admin") ? "admin123" :
                          role.equalsIgnoreCase("driver") ? "driver123" : "rider123";

        if (role.equalsIgnoreCase("admin")) {
            email = "admin@uber.com";
        } else if (role.equalsIgnoreCase("driver")) {
            email = "driver.john@uber.com";
        } else {
            email = "rider@uber.com";
        }

        return ResponseEntity.ok(authService.login(new AuthRequest(email, password)));
    }
}

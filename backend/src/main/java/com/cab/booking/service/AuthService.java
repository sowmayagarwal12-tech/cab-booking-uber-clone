package com.cab.booking.service;

import com.cab.booking.dto.AuthRequest;
import com.cab.booking.dto.AuthResponse;
import com.cab.booking.dto.RegisterRequest;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.User;
import com.cab.booking.enums.Role;
import com.cab.booking.enums.VehicleType;
import com.cab.booking.repository.DriverRepository;
import com.cab.booking.repository.UserRepository;
import com.cab.booking.security.JwtTokenProvider;
import com.cab.booking.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       DriverRepository driverRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String jwt = tokenProvider.generateToken(
                userPrincipal.getUsername(),
                userPrincipal.getId(),
                userPrincipal.getRole()
        );

        Long driverId = null;
        if (userPrincipal.getRole() == Role.ROLE_DRIVER) {
            driverId = driverRepository.findByUserId(userPrincipal.getId())
                    .map(Driver::getId).orElse(null);
        }

        return new AuthResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getFullName(),
                userPrincipal.getUsername(),
                userPrincipal.getRole(),
                driverId
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                request.getRole()
        );

        User savedUser = userRepository.save(user);

        Long driverId = null;
        if (request.getRole() == Role.ROLE_DRIVER) {
            Driver driver = new Driver(
                    savedUser,
                    request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-" + System.currentTimeMillis() % 10000,
                    request.getVehicleModel() != null ? request.getVehicleModel() : "Toyota Prius Hybrid",
                    request.getVehicleNumber() != null ? request.getVehicleNumber() : "UB-" + (System.currentTimeMillis() % 1000),
                    request.getVehicleType() != null ? request.getVehicleType() : VehicleType.ECONOMY
            );
            Driver savedDriver = driverRepository.save(driver);
            driverId = savedDriver.getId();
        }

        String jwt = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRole());

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                driverId
        );
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("No authenticated user found");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

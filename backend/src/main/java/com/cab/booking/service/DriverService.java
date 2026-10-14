package com.cab.booking.service;

import com.cab.booking.dto.DriverLocationUpdate;
import com.cab.booking.entity.Driver;
import com.cab.booking.entity.User;
import com.cab.booking.repository.DriverRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final FareCalculatorService fareCalculatorService;
    private final SimpMessagingTemplate messagingTemplate;

    public DriverService(DriverRepository driverRepository,
                         FareCalculatorService fareCalculatorService,
                         SimpMessagingTemplate messagingTemplate) {
        this.driverRepository = driverRepository;
        this.fareCalculatorService = fareCalculatorService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public Driver getDriverByUser(User user) {
        return driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Driver profile not found for user: " + user.getEmail()));
    }

    @Transactional(readOnly = true)
    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
    }

    @Transactional
    public Driver toggleOnlineStatus(Long driverId, boolean isOnline) {
        Driver driver = getDriverById(driverId);
        driver.setIsOnline(isOnline);
        if (!isOnline) {
            driver.setIsAvailable(false);
        } else {
            driver.setIsAvailable(true);
        }
        Driver saved = driverRepository.save(driver);

        // Broadcast driver status update
        messagingTemplate.convertAndSend("/topic/driver-status", saved);
        return saved;
    }

    @Transactional
    public Driver updateLocation(Long driverId, DriverLocationUpdate update) {
        Driver driver = getDriverById(driverId);
        driver.setCurrentLatitude(update.getLatitude());
        driver.setCurrentLongitude(update.getLongitude());
        Driver saved = driverRepository.save(driver);

        // If there's an active ride attached to this location update, broadcast to ride topic
        if (update.getRideId() != null) {
            messagingTemplate.convertAndSend("/topic/driver-location/" + update.getRideId(), update);
        }

        // Also broadcast to general map tracker
        messagingTemplate.convertAndSend("/topic/driver-tracker", update);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Driver> findNearbyAvailableDrivers(double lat, double lng, double radiusKm) {
        List<Driver> activeDrivers = driverRepository.findByIsOnlineTrueAndIsAvailableTrue();

        return activeDrivers.stream()
                .filter(d -> d.getCurrentLatitude() != null && d.getCurrentLongitude() != null)
                .filter(d -> {
                    double dist = fareCalculatorService.calculateDistanceKm(
                            lat, lng, d.getCurrentLatitude(), d.getCurrentLongitude());
                    return dist <= radiusKm;
                })
                .sorted(Comparator.comparingDouble(d ->
                        fareCalculatorService.calculateDistanceKm(lat, lng, d.getCurrentLatitude(), d.getCurrentLongitude())
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Driver> getAllOnlineDrivers() {
        return driverRepository.findByIsOnlineTrue();
    }
}

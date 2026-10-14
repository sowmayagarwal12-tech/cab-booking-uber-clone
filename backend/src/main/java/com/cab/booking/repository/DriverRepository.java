package com.cab.booking.repository;

import com.cab.booking.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByUserId(Long userId);
    Optional<Driver> findByUserEmail(String email);
    List<Driver> findByIsOnlineTrueAndIsAvailableTrue();
    List<Driver> findByIsOnlineTrue();
}

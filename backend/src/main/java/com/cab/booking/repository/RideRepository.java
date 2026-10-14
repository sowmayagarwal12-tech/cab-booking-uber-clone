package com.cab.booking.repository;

import com.cab.booking.entity.Ride;
import com.cab.booking.enums.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByRiderIdOrderByCreatedAtDesc(Long riderId);
    List<Ride> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    Optional<Ride> findFirstByRiderIdAndStatusInOrderByCreatedAtDesc(Long riderId, Collection<RideStatus> statuses);
    Optional<Ride> findFirstByDriverIdAndStatusInOrderByCreatedAtDesc(Long driverId, Collection<RideStatus> statuses);
    List<Ride> findByStatusOrderByCreatedAtDesc(RideStatus status);
    List<Ride> findAllByOrderByCreatedAtDesc();
    long countByStatus(RideStatus status);
}

package com.cab.booking.dto;

public class DriverLocationUpdate {
    private Long rideId;
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private Double heading;
    private Double speed;

    public DriverLocationUpdate() {}

    public DriverLocationUpdate(Long rideId, Long driverId, Double latitude, Double longitude, Double heading, Double speed) {
        this.rideId = rideId;
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.heading = heading;
        this.speed = speed;
    }

    public Long getRideId() {
        return rideId;
    }

    public void setRideId(Long rideId) {
        this.rideId = rideId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getHeading() {
        return heading;
    }

    public void setHeading(Double heading) {
        this.heading = heading;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }
}

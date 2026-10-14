package com.cab.booking.dto;

import com.cab.booking.enums.VehicleType;
import java.util.List;

public class RideEstimateResponse {
    private Double distanceKm;
    private Integer durationMinutes;
    private Double surgeMultiplier;
    private Double promoDiscount;
    private List<VehicleOption> options;

    public static class VehicleOption {
        private VehicleType vehicleType;
        private String name;
        private String description;
        private Integer capacity;
        private Double estimatedFare;
        private Integer etaMinutes;

        public VehicleOption() {}

        public VehicleOption(VehicleType vehicleType, String name, String description, Integer capacity, Double estimatedFare, Integer etaMinutes) {
            this.vehicleType = vehicleType;
            this.name = name;
            this.description = description;
            this.capacity = capacity;
            this.estimatedFare = estimatedFare;
            this.etaMinutes = etaMinutes;
        }

        public VehicleType getVehicleType() {
            return vehicleType;
        }

        public void setVehicleType(VehicleType vehicleType) {
            this.vehicleType = vehicleType;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public Double getEstimatedFare() {
            return estimatedFare;
        }

        public void setEstimatedFare(Double estimatedFare) {
            this.estimatedFare = estimatedFare;
        }

        public Integer getEtaMinutes() {
            return etaMinutes;
        }

        public void setEtaMinutes(Integer etaMinutes) {
            this.etaMinutes = etaMinutes;
        }
    }

    public RideEstimateResponse() {}

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getSurgeMultiplier() {
        return surgeMultiplier;
    }

    public void setSurgeMultiplier(Double surgeMultiplier) {
        this.surgeMultiplier = surgeMultiplier;
    }

    public Double getPromoDiscount() {
        return promoDiscount;
    }

    public void setPromoDiscount(Double promoDiscount) {
        this.promoDiscount = promoDiscount;
    }

    public List<VehicleOption> getOptions() {
        return options;
    }

    public void setOptions(List<VehicleOption> options) {
        this.options = options;
    }
}

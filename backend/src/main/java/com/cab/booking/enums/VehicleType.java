package com.cab.booking.enums;

public enum VehicleType {
    ECONOMY(1.0, 10.0, "Economy Hatchback", 4),
    COMFORT(1.25, 14.0, "Comfort Sedan", 4),
    PREMIER(1.6, 20.0, "Premier Luxury", 4),
    XL(1.8, 25.0, "SUV / 6 Seater", 6);

    private final double multiplier;
    private final double baseFare;
    private final String description;
    private final int capacity;

    VehicleType(double multiplier, double baseFare, String description, int capacity) {
        this.multiplier = multiplier;
        this.baseFare = baseFare;
        this.description = description;
        this.capacity = capacity;
    }

    public double getMultiplier() {
        return multiplier;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public String getDescription() {
        return description;
    }

    public int getCapacity() {
        return capacity;
    }
}

package com.cab.booking.dto;

public class AdminMetricsResponse {
    private Double totalRevenue;
    private Long totalRides;
    private Long completedRides;
    private Long activeRides;
    private Long totalDrivers;
    private Long activeDriversOnline;
    private Long totalRiders;
    private Double platformRatingAverage;
    private Long openSupportTickets;

    public AdminMetricsResponse() {}

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalRides() {
        return totalRides;
    }

    public void setTotalRides(Long totalRides) {
        this.totalRides = totalRides;
    }

    public Long getCompletedRides() {
        return completedRides;
    }

    public void setCompletedRides(Long completedRides) {
        this.completedRides = completedRides;
    }

    public Long getActiveRides() {
        return activeRides;
    }

    public void setActiveRides(Long activeRides) {
        this.activeRides = activeRides;
    }

    public Long getTotalDrivers() {
        return totalDrivers;
    }

    public void setTotalDrivers(Long totalDrivers) {
        this.totalDrivers = totalDrivers;
    }

    public Long getActiveDriversOnline() {
        return activeDriversOnline;
    }

    public void setActiveDriversOnline(Long activeDriversOnline) {
        this.activeDriversOnline = activeDriversOnline;
    }

    public Long getTotalRiders() {
        return totalRiders;
    }

    public void setTotalRiders(Long totalRiders) {
        this.totalRiders = totalRiders;
    }

    public Double getPlatformRatingAverage() {
        return platformRatingAverage;
    }

    public void setPlatformRatingAverage(Double platformRatingAverage) {
        this.platformRatingAverage = platformRatingAverage;
    }

    public Long getOpenSupportTickets() {
        return openSupportTickets;
    }

    public void setOpenSupportTickets(Long openSupportTickets) {
        this.openSupportTickets = openSupportTickets;
    }
}

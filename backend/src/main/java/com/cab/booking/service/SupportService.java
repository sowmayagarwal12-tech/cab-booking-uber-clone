package com.cab.booking.service;

import com.cab.booking.dto.SosAlertMessage;
import com.cab.booking.dto.TicketRequest;
import com.cab.booking.entity.Ride;
import com.cab.booking.entity.SupportTicket;
import com.cab.booking.entity.User;
import com.cab.booking.enums.TicketStatus;
import com.cab.booking.repository.RideRepository;
import com.cab.booking.repository.SupportTicketRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public SupportService(SupportTicketRepository ticketRepository,
                          RideRepository rideRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.ticketRepository = ticketRepository;
        this.rideRepository = rideRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public SupportTicket createTicket(TicketRequest request, User user) {
        Ride ride = null;
        if (request.getRideId() != null) {
            ride = rideRepository.findById(request.getRideId()).orElse(null);
        }

        SupportTicket ticket = new SupportTicket(
                user,
                ride,
                request.getSubject(),
                request.getDescription(),
                request.getIsEmergency()
        );

        SupportTicket saved = ticketRepository.save(ticket);

        // If Emergency SOS, broadcast to WebSocket alert topic immediately
        if (Boolean.TRUE.equals(request.getIsEmergency())) {
            SosAlertMessage sos = new SosAlertMessage();
            sos.setRideId(ride != null ? ride.getId() : null);
            sos.setRiderId(user.getId());
            sos.setRiderName(user.getFullName());
            sos.setRiderPhone(user.getPhoneNumber());

            if (ride != null && ride.getDriver() != null) {
                sos.setDriverId(ride.getDriver().getId());
                sos.setDriverName(ride.getDriver().getUser().getFullName());
                sos.setDriverPhone(ride.getDriver().getUser().getPhoneNumber());
                sos.setVehicleNumber(ride.getDriver().getVehicleNumber());
                sos.setCurrentLatitude(ride.getDriver().getCurrentLatitude());
                sos.setCurrentLongitude(ride.getDriver().getCurrentLongitude());
            }

            sos.setLocationDescription(request.getDescription());
            messagingTemplate.convertAndSend("/topic/sos-alerts", sos);
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getUserTickets(Long userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SupportTicket resolveTicket(Long ticketId, String notes) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(notes);
        ticket.setResolvedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}

package com.cab.booking.controller;

import com.cab.booking.dto.TicketRequest;
import com.cab.booking.entity.SupportTicket;
import com.cab.booking.entity.User;
import com.cab.booking.service.AuthService;
import com.cab.booking.service.SupportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final SupportService supportService;
    private final AuthService authService;

    public SupportController(SupportService supportService, AuthService authService) {
        this.supportService = supportService;
        this.authService = authService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@Valid @RequestBody TicketRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(supportService.createTicket(request, user));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<SupportTicket>> getMyTickets() {
        User user = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(supportService.getUserTickets(user.getId()));
    }

    @PostMapping("/sos")
    public ResponseEntity<SupportTicket> triggerSos(@RequestBody TicketRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        request.setIsEmergency(true);
        if (request.getSubject() == null) request.setSubject("🚨 EMERGENCY SOS BROADCAST");
        if (request.getDescription() == null) request.setDescription("Emergency SOS signal sent from rider app.");
        return ResponseEntity.ok(supportService.createTicket(request, user));
    }
}

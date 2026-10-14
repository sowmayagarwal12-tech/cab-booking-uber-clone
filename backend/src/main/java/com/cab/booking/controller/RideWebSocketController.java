package com.cab.booking.controller;

import com.cab.booking.dto.DriverLocationUpdate;
import com.cab.booking.dto.SosAlertMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RideWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public RideWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/driver/location")
    @SendTo("/topic/driver-tracker")
    public DriverLocationUpdate broadcastDriverLocation(DriverLocationUpdate update) {
        if (update.getRideId() != null) {
            messagingTemplate.convertAndSend("/topic/driver-location/" + update.getRideId(), update);
        }
        return update;
    }

    @MessageMapping("/ride/sos")
    @SendTo("/topic/sos-alerts")
    public SosAlertMessage broadcastSos(SosAlertMessage alert) {
        return alert;
    }
}

package com.cab.booking.controller;

import com.cab.booking.entity.PromoCode;
import com.cab.booking.repository.PromoCodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/promos")
public class PromoCodeController {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeController(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromo(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        Map<String, Object> res = new HashMap<>();

        if (code == null || code.trim().isEmpty()) {
            res.put("valid", false);
            res.put("message", "Promo code cannot be empty");
            return ResponseEntity.badRequest().body(res);
        }

        Optional<PromoCode> promoOpt = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());

        if (promoOpt.isPresent()) {
            PromoCode promo = promoOpt.get();
            if (promo.getExpiryDate() != null && promo.getExpiryDate().isBefore(LocalDateTime.now())) {
                res.put("valid", false);
                res.put("message", "This promo code has expired");
                return ResponseEntity.ok(res);
            }
            res.put("valid", true);
            res.put("code", promo.getCode());
            res.put("discountPercentage", promo.getDiscountPercentage());
            res.put("maxDiscountAmount", promo.getMaxDiscountAmount());
            res.put("message", "Promo applied: " + promo.getDiscountPercentage() + "% discount!");
            return ResponseEntity.ok(res);
        } else {
            res.put("valid", false);
            res.put("message", "Invalid promo code");
            return ResponseEntity.ok(res);
        }
    }
}

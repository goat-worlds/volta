package com.volta.controller;

import com.volta.domain.Role;
import com.volta.dto.NotificationDto;
import com.volta.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
public class NotificationController {
  private final NotificationService notificationService;

  @GetMapping
  public ResponseEntity<List<NotificationDto>> getNotifications(
      @RequestParam(required = false, defaultValue = "false") boolean unreadOnly
  ) {
    // In real app, get role from authentication
    Role role = Role.SUPPLIER; // Default, should come from user context

    List<NotificationDto> response = unreadOnly
        ? notificationService.getUnreadNotifications(role)
        : notificationService.getNotifications(role);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/unread-count")
  public ResponseEntity<Map<String, Object>> getUnreadCount() {
    Role role = Role.SUPPLIER;
    long count = notificationService.getUnreadCount(role);
    return ResponseEntity.ok(Map.of("unreadCount", count));
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<NotificationDto> markAsRead(@PathVariable String id) {
    NotificationDto response = notificationService.markAsRead(id);
    return ResponseEntity.ok(response);
  }
}

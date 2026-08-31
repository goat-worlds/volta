package com.volta.service;

import com.volta.domain.Notification;
import com.volta.domain.Role;
import com.volta.dto.NotificationDto;
import com.volta.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
  private final NotificationRepository notificationRepository;

  public NotificationDto createNotification(Role role, String message) {
    Notification notification = Notification.builder()
        .id("n-" + UUID.randomUUID().toString().substring(0, 8))
        .role(role)
        .message(message)
        .date(LocalDateTime.now())
        .read(false)
        .build();

    Notification saved = notificationRepository.save(notification);
    return toDto(saved);
  }

  public List<NotificationDto> getNotifications(Role role) {
    return notificationRepository.findByRoleOrderByDateDesc(role).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<NotificationDto> getUnreadNotifications(Role role) {
    return notificationRepository.findByRoleAndReadIsFalseOrderByDateDesc(role).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public long getUnreadCount(Role role) {
    return notificationRepository.countByRoleAndReadIsFalse(role);
  }

  public NotificationDto markAsRead(String id) {
    Notification notification = notificationRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Notification not found"));
    notification.setRead(true);
    Notification saved = notificationRepository.save(notification);
    return toDto(saved);
  }

  private NotificationDto toDto(Notification notification) {
    return NotificationDto.builder()
        .id(notification.getId())
        .role(notification.getRole())
        .message(notification.getMessage())
        .date(notification.getDate())
        .read(notification.getRead())
        .build();
  }
}

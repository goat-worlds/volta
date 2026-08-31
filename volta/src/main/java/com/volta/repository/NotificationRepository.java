package com.volta.repository;

import com.volta.domain.Notification;
import com.volta.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
  List<Notification> findByRoleOrderByDateDesc(Role role);
  List<Notification> findByRoleAndReadIsFalseOrderByDateDesc(Role role);
  long countByRoleAndReadIsFalse(Role role);
}

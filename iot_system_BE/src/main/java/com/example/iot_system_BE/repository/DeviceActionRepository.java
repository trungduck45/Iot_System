package com.example.iot_system_BE.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.iot_system_BE.entity.DeviceAction;

// Repository cho DeviceAction
public interface DeviceActionRepository extends JpaRepository<DeviceAction, Long> {
}

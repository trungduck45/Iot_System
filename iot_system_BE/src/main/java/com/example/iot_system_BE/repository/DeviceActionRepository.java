package com.example.iot_system_BE.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.iot_system_BE.entity.DeviceAction;
import com.example.iot_system_BE.entity.EnvironmentalData;

// Repository cho DeviceAction
public interface DeviceActionRepository extends JpaRepository<DeviceAction, Long> {
    
    @Query("SELECT e FROM DeviceAction e WHERE " +
    "FUNCTION('DATE_FORMAT', e.time, '%Y-%m-%d %H:%i:%s') = :timeString")
List<DeviceAction> findByExactTimestamp(@Param("timeString") String timeString);
}

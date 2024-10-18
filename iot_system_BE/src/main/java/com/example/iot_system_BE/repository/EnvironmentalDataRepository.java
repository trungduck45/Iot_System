package com.example.iot_system_BE.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.iot_system_BE.entity.EnvironmentalData;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface EnvironmentalDataRepository extends JpaRepository<EnvironmentalData, Long> {
    List<EnvironmentalData> findByTemperature(double temperature);
    List<EnvironmentalData> findByHumidity(double humidity);
    List<EnvironmentalData> findByLight(double light);
    // @Query("SELECT e FROM EnvironmentalData e WHERE e.time = ?1")
    // List<EnvironmentalData> findByExactTimestamp(LocalDateTime timestamp);
    @Query(value = "SELECT * FROM environmental_data e WHERE DATE_FORMAT(e.time, '%Y-%m-%d %H:%i:%s') LIKE CONCAT(:timePattern, '%')", nativeQuery = true)
    List<EnvironmentalData> findByPartialTimestamp(@Param("timePattern") String timePattern);
    
    // @Query(value = "SELECT * FROM environmental_data e WHERE DATE_FORMAT(e.time, '%Y-%m-%d %H-%i-%s') = ?1", nativeQuery = true)
    // List<EnvironmentalData> findByDateTimeNative(String dateTime);
}
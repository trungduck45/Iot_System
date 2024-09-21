package com.example.iot_system_BE.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.iot_system_BE.entity.EnvironmentalData;

// Repository cho EnvironmentalData
public interface EnvironmentalDataRepository extends JpaRepository<EnvironmentalData, Long> {
}
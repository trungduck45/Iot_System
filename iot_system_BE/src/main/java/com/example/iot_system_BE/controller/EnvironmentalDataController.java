package com.example.iot_system_BE.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.iot_system_BE.entity.EnvironmentalData;
import com.example.iot_system_BE.repository.EnvironmentalDataRepository;
import com.example.iot_system_BE.service.EnvironmentalDataService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
@RestController
@RequestMapping
public class EnvironmentalDataController {

    @Autowired
    private EnvironmentalDataService environmentalDataService;

    @GetMapping("/api/environmental-data")
    public List<EnvironmentalData> getAllEnvironmentalData() {
        return environmentalDataService.getAllEnvironmentalData();
    }
    private final EnvironmentalDataRepository repository;

    public EnvironmentalDataController(EnvironmentalDataRepository repository) {
        this.repository = repository;
    }

    // API tìm kiếm
    @GetMapping("/api/environmental-data/search")
    public List<EnvironmentalData> searchData(
            @RequestParam String type, 
            @RequestParam String value) {

            
        switch (type) {
            case "temperature":
                return repository.findByTemperature(Double.parseDouble(value));
            case "humidity":
                return repository.findByHumidity(Double.parseDouble(value));
            case "light":
                return repository.findByLight(Double.parseDouble(value));
             case "date":
                   // Tìm kiếm với mẫu chuỗi thời gian không đầy đủ
            return repository.findByPartialTimestamp(value);
            default:
                throw new IllegalArgumentException("Loại tìm kiếm không hợp lệ: " + type);
        }
    }
   
}
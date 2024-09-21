package com.example.iot_system_BE.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.iot_system_BE.entity.EnvironmentalData;
import com.example.iot_system_BE.service.EnvironmentalDataService;
import java.util.*;
@RestController
@RequestMapping("/api/environmental-data")
public class EnvironmentalDataController {

    @Autowired
    private EnvironmentalDataService environmentalDataService;

    @GetMapping
    public List<EnvironmentalData> getAllEnvironmentalData() {
        return environmentalDataService.getAllEnvironmentalData();
    }
    
}
package com.example.iot_system_BE.service;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.iot_system_BE.repository.EnvironmentalDataRepository;
import com.example.iot_system_BE.entity.EnvironmentalData;
@Service
public class EnvironmentalDataService {

    @Autowired
    private EnvironmentalDataRepository environmentalDataRepository;

    public List<EnvironmentalData> getAllEnvironmentalData() {
        return environmentalDataRepository.findAll();
    }
}